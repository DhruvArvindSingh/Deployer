package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	"github.com/dhruvsingh/deployer-backend/config"
	"github.com/dhruvsingh/deployer-backend/middleware"
	"github.com/dhruvsingh/deployer-backend/models"
	"github.com/gorilla/mux"
	"github.com/minio/minio-go/v7"
)

func DeployProject(db *sql.DB, minioClient *minio.Client, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Parse multipart form (max 500MB)
		if err := r.ParseMultipartForm(500 << 20); err != nil {
			respondError(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		projectName := r.FormValue("project_name")
		if projectName == "" {
			respondError(w, "project_name is required", http.StatusBadRequest)
			return
		}

		// Get user ID
		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		// Get or create project
		var projectID string
		err = db.QueryRow("SELECT id FROM projects WHERE name = $1 AND user_id = $2", projectName, userID).Scan(&projectID)
		
		if err == sql.ErrNoRows {
			// Create new project
			err = db.QueryRow(`
				INSERT INTO projects (user_id, name)
				VALUES ($1, $2)
				RETURNING id
			`, userID, projectName).Scan(&projectID)
			
			if err != nil {
				respondError(w, "Failed to create project", http.StatusInternalServerError)
				return
			}
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		// Create deployment record
		var deploymentID string
		err = db.QueryRow(`
			INSERT INTO deployments (project_id, status)
			VALUES ($1, 'uploading')
			RETURNING id
		`, projectID).Scan(&deploymentID)

		if err != nil {
			respondError(w, "Failed to create deployment", http.StatusInternalServerError)
			return
		}

		// Create bucket if it doesn't exist
		ctx := context.Background()
		bucketExists, err := minioClient.BucketExists(ctx, projectName)
		if err != nil {
			updateDeploymentStatus(db, deploymentID, "failed", fmt.Sprintf("Bucket check error: %v", err))
			respondError(w, "MinIO error", http.StatusInternalServerError)
			return
		}

		if !bucketExists {
			err = minioClient.MakeBucket(ctx, projectName, minio.MakeBucketOptions{})
			if err != nil {
				updateDeploymentStatus(db, deploymentID, "failed", fmt.Sprintf("Bucket creation error: %v", err))
				respondError(w, "Failed to create bucket", http.StatusInternalServerError)
				return
			}

			// Set bucket policy to public (download)
			policy := fmt.Sprintf(`{
				"Version": "2012-10-17",
				"Statement": [{
					"Effect": "Allow",
					"Principal": {"AWS": ["*"]},
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::%s/*"]
				}]
			}`, projectName)

			err = minioClient.SetBucketPolicy(ctx, projectName, policy)
			if err != nil {
				log.Printf("Warning: Failed to set bucket policy: %v", err)
			}
		}

		// Upload files
		filesCount := 0
		var totalSize int64

		files := r.MultipartForm.File["files"]
		for _, fileHeader := range files {
			file, err := fileHeader.Open()
			if err != nil {
				continue
			}
			defer file.Close()

			objectName := fileHeader.Header.Get("X-File-Path")
		if objectName == "" {
			objectName = fileHeader.Filename
		}
		log.Printf("📂 fileHeader.Filename: %s", objectName)
			contentType := fileHeader.Header.Get("Content-Type")
		log.Printf("🔍 From header: %s (empty=%v)", contentType, contentType == "")
			if contentType == "" {
				contentType = getContentType(objectName)
			}

		log.Printf("📤 Uploading %s with Content-Type: %s", objectName, contentType)
			info, err := minioClient.PutObject(ctx, projectName, objectName, file, fileHeader.Size, minio.PutObjectOptions{
				ContentType: contentType,
			})

			if err != nil {
				log.Printf("Failed to upload %s: %v", objectName, err)
				continue
			}

			filesCount++
			totalSize += info.Size
		}

		// Update deployment record
		_, err = db.Exec(`
			UPDATE deployments
			SET status = 'success', files_count = $1, size_bytes = $2
			WHERE id = $3
		`, filesCount, totalSize, deploymentID)

		if err != nil {
			log.Printf("Failed to update deployment: %v", err)
		}

		respondJSON(w, map[string]interface{}{
			"deployment_id": deploymentID,
			"project_name":  projectName,
			"files_count":   filesCount,
			"size_bytes":    totalSize,
			"url":           fmt.Sprintf("http://%s.%s", projectName, cfg.DeployDomain),
		}, http.StatusOK)
	}
}

func GetDeploymentStatus(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		deploymentID := vars["id"]

		var deployment models.Deployment
		err := db.QueryRow(`
			SELECT d.id, d.project_id, d.status, d.files_count, d.size_bytes, d.logs, d.created_at
			FROM deployments d
			JOIN projects p ON d.project_id = p.id
			JOIN users u ON p.user_id = u.id
			WHERE d.id = $1 AND u.email = $2
		`, deploymentID, user.Email).Scan(
			&deployment.ID, &deployment.ProjectID, &deployment.Status,
			&deployment.FilesCount, &deployment.SizeBytes, &deployment.Logs, &deployment.CreatedAt,
		)

		if err == sql.ErrNoRows {
			respondError(w, "Deployment not found", http.StatusNotFound)
			return
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		respondJSON(w, deployment, http.StatusOK)
	}
}

func GetDeploymentLogs(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		deploymentID := vars["id"]

		var logs string
		err := db.QueryRow(`
			SELECT d.logs
			FROM deployments d
			JOIN projects p ON d.project_id = p.id
			JOIN users u ON p.user_id = u.id
			WHERE d.id = $1 AND u.email = $2
		`, deploymentID, user.Email).Scan(&logs)

		if err == sql.ErrNoRows {
			respondError(w, "Deployment not found", http.StatusNotFound)
			return
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		respondJSON(w, map[string]string{"logs": logs}, http.StatusOK)
	}
}

func updateDeploymentStatus(db *sql.DB, deploymentID, status, logs string) {
	_, err := db.Exec(`
		UPDATE deployments
		SET status = $1, logs = $2
		WHERE id = $3
	`, status, logs, deploymentID)
	
	if err != nil {
		log.Printf("Failed to update deployment status: %v", err)
	}
}

func getContentType(filename string) string {
	ext := filepath.Ext(filename)
	log.Printf("🔍 getContentType: filename=%s, ext=%s", filename, ext)
	contentTypes := map[string]string{
		".html": "text/html",
		".css":  "text/css",
		".js":   "application/javascript",
		".json": "application/json",
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".gif":  "image/gif",
		".svg":  "image/svg+xml",
		".ico":  "image/x-icon",
		".woff": "font/woff",
		".woff2": "font/woff2",
		".ttf":  "font/ttf",
		".pdf":  "application/pdf",
	}

	if ct, ok := contentTypes[ext]; ok {
		return ct
	}
	return "application/octet-stream"
}
