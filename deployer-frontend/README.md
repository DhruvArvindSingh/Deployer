# DeployNet Frontend

Next.js 14 web dashboard for the DeployNet platform — inspired by Vercel's UI.

## Features

- **OAuth Login** — Sign in with GitHub or Google
- **Dashboard** — View all your deployed projects with timing, status, and links
- **Project Detail** — See full deployment history with file counts, sizes, and logs
- **Rollback** — Roll back to any previous successful deployment
- **Explore** — Browse all public deployments from the community
- **Profile** — Update your display name, avatar, bio, and website
- **Setup Guide** — Step-by-step instructions for CLI, backend, and auth setup

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your backend URL and OAuth client IDs

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://deployer-be.dsingh.fun` |
| `NEXT_PUBLIC_DEPLOY_DOMAIN` | Base domain for deployments | `dsingh.fun` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth Client ID | — |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | — |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion + CSS

---

**Part of DeployNet** — The homelab deployment platform
