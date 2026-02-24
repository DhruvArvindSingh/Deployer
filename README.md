# Deployer / DeployNet 🚀

Self-hosted tooling for deploying static sites (Next.js, Vite, CRA, etc.) to your homelab or cluster via a simple CLI.

## Project Structure

Repository root: `/home/dhruv/C_drive/Code/deployer-full-cli`

```text
Deployer-cli/        # Go CLI (binary: deployer)
Deployer-backend/    # Go backend API (auth, projects, deployments)
Deployer-auth-page/  # OAuth auth UI (Next.js app + static HTML variant)
README.md            # This file
```

### Components

- **CLI (`Deployer-cli`)**
  - Commands: `login`, `deploy`, `list`, `status`, `delete`
  - Uses a central `config/config.go` for:
    - `APIURL` – backend base URL (e.g. `http://deployer-be.dsingh.fun`)
    - `AuthURL` – auth page URL (e.g. `http://deployer-cli.dsingh.fun`)
  - Uploads built static assets to the backend (MinIO under the hood)

- **Backend (`Deployer-backend`)**
  - Go HTTP API with:
    - Auth (JWT-based, GitHub/Google integration)
    - Projects and deployments
    - MinIO integration for static file storage
  - Strong `.env`-based configuration with validation
  - Dev helpers:
    - `setup-env.sh` – interactive `.env` generator
    - `dev-start.sh` – starts Postgres + MinIO (Docker) and runs backend

- **Auth Page (`Deployer-auth-page`)**
  - Next.js app for OAuth login flows
  - Static `index.html` + `callback.html` variant for simple hosting
  - `README.md` in this folder explains how to set:
    - Backend URL
    - CLI callback URL
    - GitHub / Google client IDs

## Quick Start (Local Dev)

### 1. Backend

```bash
cd Deployer-backend

# One-command dev environment (Postgres + MinIO + backend)
./dev-start.sh
```

Backend will be available at `http://localhost:8080` (default in `.env.dev`).

### 2. Auth Page (Next.js dev mode)

```bash
cd Deployer-auth-page
npm install
npm run dev   # runs on http://localhost:3000 by default
```

For the static HTML variant, see `Deployer-auth-page/README.md`.

### 3. CLI

```bash
cd Deployer-cli
go build -o deployer

# Login (opens AuthURL from config/config.go)
./deployer login

# Deploy from a project directory (Next.js/Vite/CRA)
cd /path/to/your/project
/path/to/deployer deploy
```

## Features

- ✅ `deployer deploy` builds and uploads static sites
- ✅ GitHub / Google OAuth login
- ✅ Automatic framework detection:
  - Next.js (`next.config.js/ts` → `out/`)
  - Vite (`vite.config.js/ts` → `dist/`)
  - Create React App (`react-scripts` → `build/`)
- ✅ MinIO-backed storage with per-project buckets
- ✅ Per-project config stored in `.deployer/config.json`
- ✅ Strict backend env validation (no unsafe defaults)

## Configuration Overview

- **CLI**
  - `Deployer-cli/config/config.go`:
    - `APIURL` – backend base URL
    - `AuthURL` – auth page URL

- **Backend**
  - `Deployer-backend/.env` (or `.env.dev` for local dev)
  - Required vars include:
    - `DATABASE_URL`, `JWT_SECRET`
    - `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
    - `DEPLOY_DOMAIN`
  - See `Deployer-backend/README.md` and `.env.example` for full list.

- **Auth Page**
  - See `Deployer-auth-page/README.md` for how to wire:
    - `BACKEND_URL`
    - `CLI_CALLBACK_URL`
    - OAuth client IDs

---

**Version:** 1.0  
**Author:** Dhruv Singh  
**License:** MIT
