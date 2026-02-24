package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/dhruvsingh/deployer-backend/middleware"
	"github.com/dhruvsingh/deployer-backend/models"
	"github.com/gorilla/mux"
	"github.com/minio/minio-go/v7"
)

func ListProjects(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Get user ID from database
		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		rows, err := db.Query(`
			SELECT id, user_id, name, active_deployment_id, created_at
			FROM projects WHERE user_id = $1
			ORDER BY created_at DESC
		`, userID)
		if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var projects []models.Project
		for rows.Next() {
			var p models.Project
			if err := rows.Scan(&p.ID, &p.UserID, &p.Name, &p.ActiveDeploymentID, &p.CreatedAt); err != nil {
				continue
			}
			projects = append(projects, p)
		}

		respondJSON(w, projects, http.StatusOK)
	}
}

func CreateProject(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req struct {
			Name string `json:"name"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Name == "" {
			respondError(w, "Project name is required", http.StatusBadRequest)
			return
		}

		// Check if name is reserved
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM reserved_names WHERE name = $1)", req.Name).Scan(&exists)
		if err == nil && exists {
			respondError(w, "Project name is reserved", http.StatusConflict)
			return
		}

		// Get user ID
		var userID string
		err = db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		// Create project
		var project models.Project
		err = db.QueryRow(`
			INSERT INTO projects (user_id, name)
			VALUES ($1, $2)
			RETURNING id, user_id, name, created_at
		`, userID, req.Name).Scan(&project.ID, &project.UserID, &project.Name, &project.CreatedAt)

		if err != nil {
			if err.Error() == `pq: duplicate key value violates unique constraint "projects_name_key"` {
				respondError(w, "Project name already exists", http.StatusConflict)
				return
			}
			respondError(w, "Failed to create project", http.StatusInternalServerError)
			return
		}

		respondJSON(w, project, http.StatusCreated)
	}
}

func GetProject(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		projectID := vars["id"]

		// Get user ID
		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		var project models.Project
		err = db.QueryRow(`
			SELECT id, user_id, name, active_deployment_id, created_at
			FROM projects WHERE id = $1 AND user_id = $2
		`, projectID, userID).Scan(&project.ID, &project.UserID, &project.Name, &project.ActiveDeploymentID, &project.CreatedAt)

		if err == sql.ErrNoRows {
			respondError(w, "Project not found", http.StatusNotFound)
			return
		} else if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		respondJSON(w, project, http.StatusOK)
	}
}

func DeleteProject(db *sql.DB, minioClient *minio.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := middleware.GetUserFromContext(r)
		if user == nil {
			respondError(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		projectID := vars["id"]

		// Get user ID
		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&userID)
		if err != nil {
			respondError(w, "User not found", http.StatusNotFound)
			return
		}

		// Get project name (for bucket deletion)
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

		// Delete from database (cascades to deployments)
		_, err = db.Exec("DELETE FROM projects WHERE id = $1", projectID)
		if err != nil {
			respondError(w, "Failed to delete project", http.StatusInternalServerError)
			return
		}

		// TODO: Delete MinIO bucket (implement bucket deletion logic)
		// For now, we'll leave the bucket in place

		respondJSON(w, map[string]string{"message": "Project deleted successfully"}, http.StatusOK)
	}
}

func CheckBucketAvailability(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name string `json:"name"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Check reserved names
		var reserved bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM reserved_names WHERE name = $1)", req.Name).Scan(&reserved)
		if err == nil && reserved {
			respondJSON(w, map[string]bool{"available": false}, http.StatusOK)
			return
		}

		// Check existing projects
		var exists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM projects WHERE name = $1)", req.Name).Scan(&exists)
		if err != nil {
			respondError(w, "Database error", http.StatusInternalServerError)
			return
		}

		respondJSON(w, map[string]bool{"available": !exists}, http.StatusOK)
	}
}
