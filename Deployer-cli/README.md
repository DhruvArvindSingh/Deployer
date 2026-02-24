# DeployNet CLI

Command-line tool for deploying static sites to your DeployNet homelab.

## Installation

### From Source

```bash
cd cli
go build -o deployer
sudo mv deployer /usr/local/bin/
```

### Pre-built Binary

Download from releases and move to your PATH.

## Usage

### 1. Login

Authenticate with GitHub or Google:

```bash
deployer login
```

This will:
- Open your browser to the auth page
- Wait for you to log in
- Save your JWT token to `~/.deployer/config.json`

### 2. Deploy

Deploy your current directory:

```bash
cd my-nextjs-app
deployer deploy
```

This will:
- Detect your project type (Next.js, Vite, CRA)
- Run `npm run build`
- Upload files to MinIO
- Give you a live URL

### 3. List Projects

View all your deployed projects:

```bash
deployer list
```

### 4. Check Status

View current project status:

```bash
deployer status
```

### 5. Delete Project

Delete a deployed project:

```bash
deployer delete <project-id>
```

## Supported Project Types

- **Next.js**: Automatically detects `next.config.js/ts` and uses `out/` directory
- **Vite**: Automatically detects `vite.config.js/ts` and uses `dist/` directory
- **Create React App**: Automatically detects `react-scripts` and uses `build/` directory

## Configuration

### Global Config

Stored in `~/.deployer/config.json`:

```json
{
  "token": "your-jwt-token",
  "email": "you@example.com"
}
```

### Project Config

Stored in `.deployer/config.json` (in your project root):

```json
{
  "project_id": "uuid",
  "bucket_name": "my-site",
  "last_deploy": "2026-02-13T19:00:00Z"
}
```

## Flags

```bash
--api <url>    Backend API URL (default: http://localhost:8080)
--help         Show help
--version      Show version
```

## Examples

### Deploy a Next.js site

```bash
cd my-nextjs-site
deployer deploy
```

### Deploy with custom API URL

```bash
deployer --api http://api.example.com deploy
```

### List all projects

```bash
deployer list
```

## Troubleshooting

### "not authenticated"

Run `deployer login` to authenticate.

### "unsupported project type"

Make sure you have a `next.config.js`, `vite.config.js`, or `package.json` with `react-scripts`.

### "build failed"

Check that `npm run build` works manually.

### "project name already taken"

Choose a different project name when prompted.

---

**Part of DeployNet** - The homelab deployment platform
