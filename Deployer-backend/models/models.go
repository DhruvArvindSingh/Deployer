package models

import "time"

type User struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	Provider   string    `json:"provider"`
	ProviderID string    `json:"provider_id"`
	Username   string    `json:"username"`
	CreatedAt  time.Time `json:"created_at"`
}

type Project struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	URL       string    `json:"url,omitempty"`
}

type Deployment struct {
	ID         string    `json:"id"`
	ProjectID  string    `json:"project_id"`
	Status     string    `json:"status"`
	FilesCount int       `json:"files_count"`
	SizeBytes  int64     `json:"size_bytes"`
	Logs       string    `json:"logs,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type JWTClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Provider string `json:"provider"`
	Username string `json:"username"`
}
