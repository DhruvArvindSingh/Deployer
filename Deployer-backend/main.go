package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/dhruvsingh/deployer-backend/config"
	"github.com/dhruvsingh/deployer-backend/database"
	"github.com/dhruvsingh/deployer-backend/handlers"
	"github.com/dhruvsingh/deployer-backend/middleware"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/rs/cors"
)

func main() {
	// Load config
	cfg := config.Load()
	
	// Validate configuration
	if err := cfg.ValidateConfig(); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}

	// Connect to database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("✅ Connected to database")

	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize MinIO client
	minioClient, err := minio.New(cfg.MinIOEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinIOAccessKey, cfg.MinIOSecretKey, ""),
		Secure: cfg.MinIOUseSSL,
	})
	if err != nil {
		log.Fatalf("Failed to initialize MinIO: %v", err)
	}

	log.Println("✅ Connected to MinIO")

	// Setup router
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// Auth routes (public)
	r.HandleFunc("/api/auth/github/callback", handlers.GitHubCallbackHandler(db, cfg)).Methods("GET")
	r.HandleFunc("/api/auth/google/callback", handlers.GoogleCallbackHandler(db, cfg)).Methods("GET")

	// Protected routes
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware(cfg.JWTSecret, db))

	api.HandleFunc("/buckets/check", handlers.CheckBucketAvailability(db)).Methods("POST")
	api.HandleFunc("/deploy", handlers.DeployProject(db, minioClient, cfg)).Methods("POST")
	api.HandleFunc("/projects", handlers.ListProjects(db)).Methods("GET")
	api.HandleFunc("/projects/{id}", handlers.GetProject(db)).Methods("GET")
	api.HandleFunc("/projects/{id}", handlers.DeleteProject(db, minioClient)).Methods("DELETE")
	api.HandleFunc("/deployments/{id}", handlers.GetDeploymentStatus(db)).Methods("GET")
	api.HandleFunc("/deployments/{id}/logs", handlers.GetDeploymentLogs(db)).Methods("GET")

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"https://deployer-cli.dsingh.fun",
			cfg.AuthPageURL,
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	log.Printf("🚀 Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, handler))
}
