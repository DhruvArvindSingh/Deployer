package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func Connect(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

func Migrate(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		email VARCHAR(255) UNIQUE NOT NULL,
		provider VARCHAR(50) NOT NULL,
		provider_id VARCHAR(255) NOT NULL,
		username VARCHAR(255),
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS projects (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		name VARCHAR(100) NOT NULL,
		created_at TIMESTAMP DEFAULT NOW(),
		UNIQUE(name)
	);

	CREATE TABLE IF NOT EXISTS deployments (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
		status VARCHAR(50) NOT NULL,
		files_count INTEGER,
		size_bytes BIGINT,
		logs TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS reserved_names (
		name VARCHAR(100) PRIMARY KEY
	);

	INSERT INTO reserved_names (name) VALUES
		('admin'), ('api'), ('www'), ('cloud'), ('s3'), ('deployer'), ('auth'), ('status')
	ON CONFLICT (name) DO NOTHING;
	`

	_, err := db.Exec(schema)
	return err
}
