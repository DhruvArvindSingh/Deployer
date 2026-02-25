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
			active_deployment_id UUID,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW(),
			UNIQUE(user_id, name)
		)`,

		`CREATE TABLE IF NOT EXISTS deployments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
			version INTEGER NOT NULL DEFAULT 1,
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

		// Migration: add active_deployment_id to projects if not exists
		`DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'projects' AND column_name = 'active_deployment_id'
			) THEN
				ALTER TABLE projects ADD COLUMN active_deployment_id UUID;
			END IF;
		END $$`,

		// Migration: add version column to deployments if not exists
		`DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'deployments' AND column_name = 'version'
			) THEN
				ALTER TABLE deployments ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
			END IF;
		END $$`,

		// Migration: add repo_url to projects
		`DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'projects' AND column_name = 'repo_url'
			) THEN
				ALTER TABLE projects ADD COLUMN repo_url TEXT;
			END IF;
		END $$`,

		// Migration: add source, commit_hash, commit_message to deployments
		`DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'deployments' AND column_name = 'source'
			) THEN
				ALTER TABLE deployments ADD COLUMN source VARCHAR(20) DEFAULT 'cli';
			END IF;
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'deployments' AND column_name = 'commit_hash'
			) THEN
				ALTER TABLE deployments ADD COLUMN commit_hash VARCHAR(64);
			END IF;
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'deployments' AND column_name = 'commit_message'
			) THEN
				ALTER TABLE deployments ADD COLUMN commit_message TEXT;
			END IF;
		END $$`,
		// Migration: add repo_url to projects
		`DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'projects' AND column_name = 'repo_url'
			) THEN
				ALTER TABLE projects ADD COLUMN repo_url TEXT;
			END IF;
		END $$`,

		// Migration: add source and commit info to deployments
		`DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name = 'deployments' AND column_name = 'source'
			) THEN
				ALTER TABLE deployments ADD COLUMN source VARCHAR(50) DEFAULT 'cli';
				ALTER TABLE deployments ADD COLUMN commit_hash VARCHAR(100);
				ALTER TABLE deployments ADD COLUMN commit_message TEXT;
			END IF;
		END $$`,
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
