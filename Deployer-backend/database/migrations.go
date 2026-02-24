package database

import (
	"database/sql"
	"log"
)

func RunMigrations(db *sql.DB) error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			username VARCHAR(255),
			provider VARCHAR(50),
			provider_id VARCHAR(255),
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		
		`CREATE TABLE IF NOT EXISTS projects (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW(),
			UNIQUE(user_id, name)
		)`,
		
		`CREATE TABLE IF NOT EXISTS deployments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			status VARCHAR(50) NOT NULL,
			files_count INTEGER DEFAULT 0,
			size_bytes BIGINT DEFAULT 0,
			logs TEXT,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		
		`CREATE TABLE IF NOT EXISTS reserved_names (
			name VARCHAR(255) PRIMARY KEY,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		
		`INSERT INTO reserved_names (name) VALUES
			('admin'), ('api'), ('www'), ('cloud'), ('s3'), 
			('deployer'), ('auth'), ('status')
		ON CONFLICT (name) DO NOTHING`,
	}
	
	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			log.Printf("Migration error: %v", err)
			return err
		}
	}
	
	log.Println("✅ Database migrations completed")
	return nil
}
