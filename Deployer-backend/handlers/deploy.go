package handlers

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"io"

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

		// Calculate next version number
		var nextVersion int
		err = db.QueryRow(`
			SELECT COALESCE(MAX(version), 0) + 1
			FROM deployments WHERE project_id = $1
		`, projectID).Scan(&nextVersion)
		if err != nil {
			nextVersion = 1
		}

		// Create deployment record
		var deploymentID string
		err = db.QueryRow(`
			INSERT INTO deployments (project_id, status, version)
			VALUES ($1, 'uploading', $2)
			RETURNING id
		`, projectID, nextVersion).Scan(&deploymentID)

		if err != nil {
			respondError(w, "Failed to create deployment", http.StatusInternalServerError)
			return
		}

		log.Printf("📦 Deployment v%d started for project '%s' (deployment=%s)", nextVersion, projectName, deploymentID)

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

		// Upload files to both root (live) and _deployments/{id}/ (versioned)
		filesCount := 0
		var totalSize int64
		versionPrefix := fmt.Sprintf("_deployments/%s/", deploymentID)

		files := r.MultipartForm.File["files"]
		for _, fileHeader := range files {
			file, err := fileHeader.Open()
			if err != nil {
				continue
			}

			objectName := fileHeader.Header.Get("X-File-Path")
			if objectName == "" {
				objectName = fileHeader.Filename
			}

			contentType := fileHeader.Header.Get("Content-Type")
			if contentType == "" {
				contentType = getContentType(objectName)
			}

			// Read file content into memory for dual upload
			fileBytes, err := io.ReadAll(file)
			file.Close()
			if err != nil {
				log.Printf("Failed to read file %s: %v", objectName, err)
				continue
			}

			// Upload to root (live serving)
			_, err = minioClient.PutObject(ctx, projectName, objectName,
				bytes.NewReader(fileBytes), int64(len(fileBytes)),
				minio.PutObjectOptions{ContentType: contentType})
			if err != nil {
				log.Printf("Failed to upload %s to root: %v", objectName, err)
				continue
			}

			// Upload to versioned path (_deployments/{deployment-id}/...)
			_, err = minioClient.PutObject(ctx, projectName, versionPrefix+objectName,
				bytes.NewReader(fileBytes), int64(len(fileBytes)),
				minio.PutObjectOptions{ContentType: contentType})
			if err != nil {
				log.Printf("Failed to upload %s to version store: %v", objectName, err)
			}

			filesCount++
			totalSize += int64(len(fileBytes))
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

		// Set this deployment as the active one for the project
		_, err = db.Exec(`
			UPDATE projects SET active_deployment_id = $1, updated_at = NOW()
			WHERE id = $2
		`, deploymentID, projectID)
		if err != nil {
			log.Printf("Failed to set active deployment: %v", err)
		}

		log.Printf("✅ Deployment v%d complete: %d files, %d bytes", nextVersion, filesCount, totalSize)

		respondJSON(w, map[string]interface{}{
			"deployment_id": deploymentID,
			"project_name":  projectName,
			"version":       nextVersion,
			"files_count":   filesCount,
			"size_bytes":    totalSize,
			"url":           fmt.Sprintf("http://%s.%s", projectName, cfg.DeployDomain),
		}, http.StatusOK)
	}
}

// RollbackDeployment restores a previous deployment version to the bucket root
func RollbackDeployment(db *sql.DB, minioClient *minio.Client, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		projectID := vars["id"]
		deploymentID := vars["deploymentId"]

		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		var projectName string
		err = db.QueryRow(`
			SELECT name FROM projects WHERE id = $1 AND user_id = $2
		`, projectID, userID).Scan(&projectName)
		if err == sql.ErrNoRows {
			respondError(w, "Project not found", http.StatusNotFound)
			return
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		var deployVersion int
		err = db.QueryRow(`
			SELECT version FROM deployments
			WHERE id = $1 AND project_id = $2 AND status = 'success'
		`, deploymentID, projectID).Scan(&deployVersion)
		if err == sql.ErrNoRows {
			respondError(w, "Deployment not found or not successful", http.StatusNotFound)
			return
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		log.Printf("🔄 Rolling back project '%s' to v%d (deployment=%s)", projectName, deployVersion, deploymentID)

		ctx := context.Background()
		versionPrefix := fmt.Sprintf("_deployments/%s/", deploymentID)

		// Pre-check: verify versioned files exist before wiping root
		hasVersionedFiles := false
		preCheckCh := minioClient.ListObjects(ctx, projectName, minio.ListObjectsOptions{
			Prefix:    versionPrefix,
			Recursive: true,
		})
		for obj := range preCheckCh {
			if obj.Err == nil && obj.Key != "" {
				hasVersionedFiles = true
				// drain the channel
			}
		}

		if !hasVersionedFiles {
			log.Printf("❌ Rollback aborted: no versioned files found under %s", versionPrefix)
			respondError(w, fmt.Sprintf("Cannot rollback to v%d: no versioned snapshot exists for this deployment (pre-versioning deployment)", deployVersion), http.StatusBadRequest)
			return
		}

		// Step 1: Delete all root-level files (not under _deployments/)
		objectsCh := minioClient.ListObjects(ctx, projectName, minio.ListObjectsOptions{Recursive: true})
		for obj := range objectsCh {
			if obj.Err != nil {
				continue
			}
			if strings.HasPrefix(obj.Key, "_deployments/") {
				continue
			}
			minioClient.RemoveObject(ctx, projectName, obj.Key, minio.RemoveObjectOptions{})
		}

		// Step 2: Copy versioned files back to root
		copiedFiles := 0
		versionObjects := minioClient.ListObjects(ctx, projectName, minio.ListObjectsOptions{
			Prefix:    versionPrefix,
			Recursive: true,
		})

		for obj := range versionObjects {
			if obj.Err != nil {
				log.Printf("Error listing versioned object: %v", obj.Err)
				continue
			}

			originalPath := obj.Key[len(versionPrefix):]

			_, err := minioClient.CopyObject(ctx,
				minio.CopyDestOptions{Bucket: projectName, Object: originalPath},
				minio.CopySrcOptions{Bucket: projectName, Object: obj.Key},
			)
			if err != nil {
				log.Printf("Failed to copy %s: %v", originalPath, err)
				continue
			}
			copiedFiles++
		}

		// Step 3: Update active deployment in database
		_, err = db.Exec(`
			UPDATE projects SET active_deployment_id = $1, updated_at = NOW()
			WHERE id = $2
		`, deploymentID, projectID)
		if err != nil {
			respondError(w, "Failed to update active deployment", http.StatusInternalServerError)
			return
		}

		log.Printf("✅ Rollback complete: %d files restored to v%d", copiedFiles, deployVersion)

		respondJSON(w, map[string]interface{}{
			"message":       fmt.Sprintf("Rolled back to v%d", deployVersion),
			"deployment_id": deploymentID,
			"version":       deployVersion,
			"files_copied":  copiedFiles,
			"url":           fmt.Sprintf("http://%s.%s", projectName, cfg.DeployDomain),
		}, http.StatusOK)
	}
}

// ListProjectDeployments returns all deployments for a project
func ListProjectDeployments(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		projectID := vars["id"]

		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		var activeDeploymentID sql.NullString
		err = db.QueryRow(`
			SELECT active_deployment_id FROM projects WHERE id = $1 AND user_id = $2
		`, projectID, userID).Scan(&activeDeploymentID)
		if err == sql.ErrNoRows {
			respondError(w, "Project not found", http.StatusNotFound)
			return
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		rows, err := db.Query(`
			SELECT id, project_id, version, status, files_count, size_bytes, logs, created_at
			FROM deployments
			WHERE project_id = $1
			ORDER BY version DESC
		`, projectID)
		if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var deployments []models.Deployment
		for rows.Next() {
			var d models.Deployment
			if err := rows.Scan(&d.ID, &d.ProjectID, &d.Version, &d.Status,
				&d.FilesCount, &d.SizeBytes, &d.Logs, &d.CreatedAt); err != nil {
				continue
			}
			if activeDeploymentID.Valid && d.ID == activeDeploymentID.String {
				d.IsActive = true
			}
			deployments = append(deployments, d)
		}

		respondJSON(w, deployments, http.StatusOK)
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
			SELECT d.id, d.project_id, d.version, d.status, d.files_count, d.size_bytes, d.logs, d.created_at
			FROM deployments d
			JOIN projects p ON d.project_id = p.id
			JOIN users u ON p.user_id = u.id
			WHERE d.id = $1 AND u.email = $2
		`, deploymentID, user.Email).Scan(
			&deployment.ID, &deployment.ProjectID, &deployment.Version, &deployment.Status,
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

		var logs sql.NullString
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

		logStr := ""
		if logs.Valid {
			logStr = logs.String
		}

		respondJSON(w, map[string]string{"logs": logStr}, http.StatusOK)
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
		".xml":  "application/xml",
		".txt":  "text/plain",
		".map":  "application/json",
		".webp": "image/webp",
		".mp4":  "video/mp4",
		".glb":  "model/gltf-binary",
	}

	if ct, ok := contentTypes[ext]; ok {
		return ct
	}
	return "application/octet-stream"
}
