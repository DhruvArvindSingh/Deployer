# DeployNet Backend

Go API server for DeployNet - handles authentication, project management, and deployments.

## Prerequisites

- Go 1.22+
- PostgreSQL
- MinIO (or access to MinIO cluster)

## Setup

### 1. Install Go

```bash
# Ubuntu/Debian
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install Dependencies

```bash
cd backend
go mod download
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb deploynet

# Or using psql
psql -U postgres -c "CREATE DATABASE deploynet;"
```

### 4. Configure Environment

#### Option A: Interactive Setup (Recommended)
```bash
./setup-env.sh
```

#### Option B: Manual Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### Required Environment Variables
The following environment variables **must** be set:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (minimum 32 characters)
- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `DEPLOY_DOMAIN` - Domain for deployments

#### Optional Environment Variables
- `MINIO_USE_SSL` - Use SSL for MinIO (default: false)
- `AUTH_PAGE_URL` - Auth page URL (default: http://localhost:3000)
- `PORT` - Server port (default: 8080)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### 5. Run Database Migrations

Migrations run automatically on startup, but you can also run them manually:

```bash
go run main.go
```

The server will create tables and seed reserved names.

## Development

### Quick Start (Recommended)

```bash
# Start everything with one command
./dev-start.sh
```

This script will:
1. Start PostgreSQL and MinIO with Docker Compose
2. Set up development environment variables
3. Install dependencies
4. Start the backend server

### Manual Development Setup

1. **Start dependencies:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Set up environment:**
```bash
cp .env.dev .env
# Or run ./setup-env.sh for interactive setup
```

3. **Start the backend:**
```bash
go run main.go
```

Server will start on `http://localhost:8080`

### Stop Development Environment

```bash
# Stop the backend (Ctrl+C in terminal)
# Stop Docker services
docker-compose -f docker-compose.dev.yml down
```

### Build

```bash
go build -o deploynet-backend
./deploynet-backend
```

### Run tests

```bash
go test ./...
```

## Docker

### Build image

```bash
docker build -t deploynet-backend .
```

### Run container

```bash
docker run -p 8080:8080 --env-file .env deploynet-backend
```

## API Endpoints

### Health Check
- `GET /health` - Health check

### Authentication
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/auth/user` - Get current user info (requires auth)

### Projects
- `GET /api/projects` - List user's projects (requires auth)
- `POST /api/projects` - Create new project (requires auth)
- `GET /api/projects/:id` - Get project details (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)

### Deployments
- `POST /api/deploy` - Upload and deploy files (requires auth)
- `GET /api/deploy/:id/status` - Check deployment status (requires auth)
- `GET /api/deploy/:id/logs` - Get deployment logs (requires auth)

### Buckets
- `POST /api/buckets/check` - Check if bucket name is available (requires auth)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token is obtained from the auth page after OAuth login.

## Deployment to Kubernetes

See `../infra/` directory for Kubernetes manifests.

---

**Part of DeployNet** - The homelab deployment platform
