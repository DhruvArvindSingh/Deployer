# DeployNet 🚀

A self-hosted Platform-as-a-Service (PaaS) for deploying static websites to your homelab with a single command.

## Project Structure
/home/dhruv/C_drive/Code/deployer-full-cli
```
deployer/
├── cli/           # Go CLI application
├── backend/       # Go backend API service
├── auth-page/     # React/Next.js OAuth authentication page
├── infra/         # Kubernetes manifests and configs
└── docs/          # Documentation and PRD
```

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Kubernetes cluster (K3s)
- MinIO AIStor
- PostgreSQL

### Installation

```bash
# Install CLI
cd cli
go install

# Run backend
cd backend
go run main.go

# Run auth page
cd auth-page
npm install && npm run dev
```

## Features

- ✅ One-command deployment (`deployer deploy`)
- ✅ OAuth authentication (GitHub/Google)
- ✅ Automatic static site detection (Next.js, Vite)
- ✅ Smart config validation and auto-patching
- ✅ Custom subdomain mapping (*.dsingh.fun)
- ✅ Secure bucket ownership validation
- ✅ Real-time deployment progress

## Documentation

See [docs/PRD.md](docs/PRD.md) for the full Product Requirements Document.

---

**Version:** 1.0  
**Author:** Dhruv Singh  
**License:** MIT
