package config

import (
	"fmt"
	"log"
	"os"
)

type Config struct {
	// Database
	DatabaseURL string
	
	// JWT
	JWTSecret string
	
	// MinIO
	MinIOEndpoint  string
	MinIOAccessKey string
	MinIOSecretKey string
	MinIOUseSSL    bool
	
	// OAuth
	GitHubClientID     string
	GitHubClientSecret string
	GoogleClientID     string
	GoogleClientSecret string
	
	// Application
	AuthPageURL  string
	DeployDomain string
	Port         string
}

// RequiredEnvVars lists all required environment variables
var RequiredEnvVars = []string{
	"DATABASE_URL",
	"JWT_SECRET",
	"MINIO_ENDPOINT",
	"MINIO_ACCESS_KEY",
	"MINIO_SECRET_KEY",
	"DEPLOY_DOMAIN",
}

// OptionalEnvVars lists optional environment variables with their defaults
var OptionalEnvVars = map[string]string{
	"MINIO_USE_SSL": "false",
	"AUTH_PAGE_URL": "http://localhost:3000",
	"PORT":          "8080",
}

func Load() *Config {
	// Check for required environment variables
	var missingVars []string
	for _, envVar := range RequiredEnvVars {
		if os.Getenv(envVar) == "" {
			missingVars = append(missingVars, envVar)
		}
	}
	
	if len(missingVars) > 0 {
		log.Fatalf("Missing required environment variables: %v\nPlease set these variables before starting the application.", missingVars)
	}
	
	return &Config{
		DatabaseURL:        getRequiredEnv("DATABASE_URL"),
		JWTSecret:          getRequiredEnv("JWT_SECRET"),
		MinIOEndpoint:      getRequiredEnv("MINIO_ENDPOINT"),
		MinIOAccessKey:     getRequiredEnv("MINIO_ACCESS_KEY"),
		MinIOSecretKey:     getRequiredEnv("MINIO_SECRET_KEY"),
		MinIOUseSSL:        getEnvWithDefault("MINIO_USE_SSL", "false") == "true",
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		AuthPageURL:        getEnvWithDefault("AUTH_PAGE_URL", "http://localhost:3000"),
		DeployDomain:       getRequiredEnv("DEPLOY_DOMAIN"),
		Port:               getEnvWithDefault("PORT", "8080"),
	}
}

func getRequiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Required environment variable %s is not set", key)
	}
	return value
}

func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// ValidateConfig performs additional validation on the loaded configuration
func (c *Config) ValidateConfig() error {
	if c.JWTSecret == "your-super-secret-jwt-key-change-this-in-production" {
		return fmt.Errorf("JWT_SECRET must be changed from default value for security")
	}
	
	if len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters long")
	}
	
	return nil
}
