"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Terminal,
  Download,
  LogIn,
  Rocket,
  FolderOpen,
  List,
  Copy,
  Check,
  ChevronRight,
  Zap,
  Server,
  Globe,
  Shield,
} from "lucide-react";

function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group rounded-lg bg-black/40 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-gray-500">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function Step({ number, title, description, icon: Icon, children }: StepProps) {
  return (
    <div className="relative pl-10 pb-12 last:pb-0">
      {/* Connector line */}
      <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-violet-500/30 to-transparent last:hidden" />

      {/* Step number */}
      <div className="absolute left-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
        {number}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-violet-400" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        {children}
      </div>
    </div>
  );
}

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<"cli" | "backend" | "auth">("cli");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-7 h-7 text-violet-400" />
          <h1 className="text-3xl font-bold">Setup Guide</h1>
        </div>
        <p className="text-gray-400 mt-1">
          Get started deploying static sites to your homelab in minutes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl glass mb-8 w-fit">
        {[
          { id: "cli" as const, label: "CLI Setup", icon: Terminal },
          { id: "backend" as const, label: "Backend Setup", icon: Server },
          { id: "auth" as const, label: "Auth Setup", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CLI Setup */}
      {activeTab === "cli" && (
        <div className="animate-fade-in">
          <Step
            number={1}
            title="Install the CLI"
            description="Build the deployer binary from source and add it to your PATH."
            icon={Download}
          >
            <CodeBlock
              code={`# Clone the repository
git clone https://github.com/DhruvArvindSingh/Deployer.git
cd Deployer/Deployer-cli

# Build the binary
go build -o deployer

# Move to your PATH
sudo mv deployer /usr/local/bin/

# Verify installation
deployer --version`}
            />
          </Step>

          <Step
            number={2}
            title="Authenticate"
            description="Log in with your GitHub or Google account via the browser."
            icon={LogIn}
          >
            <CodeBlock
              code={`# Start the login flow
deployer login

# This will:
# 1. Open your browser to the auth page
# 2. You log in with GitHub or Google
# 3. Copy the token from the browser
# 4. Paste it back into the terminal
#
# ✓ Token saved to ~/.deployer/config.json`}
            />
            <div className="mt-3 rounded-lg bg-violet-500/5 border border-violet-500/20 p-4">
              <p className="text-sm text-violet-300">
                <strong>Tip:</strong> Your token is valid for 30 days. Run{" "}
                <code className="px-1.5 py-0.5 rounded bg-violet-500/10 text-xs">
                  deployer login
                </code>{" "}
                again when it expires.
              </p>
            </div>
          </Step>

          <Step
            number={3}
            title="Deploy Your Project"
            description="Navigate to your project directory and deploy with a single command."
            icon={Rocket}
          >
            <CodeBlock
              code={`# Navigate to your project (Next.js, Vite, or CRA)
cd ~/my-nextjs-app

# Deploy
deployer deploy

# Output:
# ℹ Detected Next.js project
# ✓ Build completed successfully
# ✓ Uploaded 42 files (2.1 MB)
#
# 🚀 Deployment Successful!
#   URL: https://my-nextjs-app.dsingh.fun`}
            />
          </Step>

          <Step
            number={4}
            title="Manage Deployments"
            description="List, check status, or delete your deployed projects."
            icon={List}
          >
            <CodeBlock
              code={`# List all your projects
deployer list

# Check status of current project
deployer status

# Delete a project
deployer delete <project-id>`}
            />
          </Step>

          {/* Supported Frameworks */}
          <div className="mt-8 rounded-xl glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              Supported Frameworks
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  name: "Next.js",
                  detect: "next.config.js/ts",
                  output: "out/",
                },
                {
                  name: "Vite",
                  detect: "vite.config.js/ts",
                  output: "dist/",
                },
                {
                  name: "Create React App",
                  detect: "react-scripts in package.json",
                  output: "build/",
                },
              ].map((fw) => (
                <div
                  key={fw.name}
                  className="rounded-lg bg-white/5 p-4 border border-white/5"
                >
                  <h4 className="font-semibold text-sm mb-2">{fw.name}</h4>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-400">Detects:</span>{" "}
                      {fw.detect}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-400">Uploads:</span>{" "}
                      {fw.output}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backend Setup */}
      {activeTab === "backend" && (
        <div className="animate-fade-in">
          <Step
            number={1}
            title="Prerequisites"
            description="Make sure you have the following installed on your server."
            icon={Server}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Go 1.22+",
                "PostgreSQL",
                "MinIO (S3-compatible storage)",
                "Kubernetes (K3s recommended)",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/5 text-sm"
                >
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </Step>

          <Step
            number={2}
            title="Clone & Configure"
            description="Clone the repository and set up your environment variables."
            icon={FolderOpen}
          >
            <CodeBlock
              code={`# Clone the repository
git clone https://github.com/DhruvArvindSingh/Deployer.git
cd Deployer/Deployer-backend

# Interactive setup (recommended)
./setup-env.sh

# Or manually create .env:
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@localhost:5432/deploynet
JWT_SECRET=your-secret-key-minimum-32-characters-long
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=minioadmin123
MINIO_USE_SSL=false
DEPLOY_DOMAIN=yourdomain.com
PORT=8080
AUTH_PAGE_URL=https://auth.yourdomain.com
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
EOF`}
            />
          </Step>

          <Step
            number={3}
            title="Run the Backend"
            description="Build and start the backend server."
            icon={Rocket}
          >
            <CodeBlock
              code={`# Install dependencies
go mod download

# Run directly
go run main.go

# Or build a binary
go build -o deploynet-backend
./deploynet-backend

# Server starts at http://localhost:8080
# ✅ Connected to database
# ✅ Connected to MinIO
# ✅ Database migrations completed
# 🚀 Server starting on port 8080`}
            />
          </Step>

          <Step
            number={4}
            title="Verify"
            description="Make sure everything is working."
            icon={Shield}
          >
            <CodeBlock
              code={`# Health check
curl http://localhost:8080/health
# Output: OK

# Run test suite
./test.sh`}
            />
          </Step>
        </div>
      )}

      {/* Auth Setup */}
      {activeTab === "auth" && (
        <div className="animate-fade-in">
          <Step
            number={1}
            title="GitHub OAuth App"
            description="Create a GitHub OAuth application for authentication."
            icon={Shield}
          >
            <div className="space-y-3">
              <div className="rounded-lg bg-white/5 border border-white/5 p-4 text-sm text-gray-300 space-y-2">
                <p>
                  1. Go to{" "}
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    className="text-violet-400 hover:underline"
                  >
                    GitHub Developer Settings
                  </a>
                </p>
                <p>2. Click &quot;New OAuth App&quot;</p>
                <p>3. Fill in:</p>
                <ul className="ml-4 space-y-1 text-gray-400">
                  <li>
                    • <strong>App name:</strong> DeployNet
                  </li>
                  <li>
                    • <strong>Homepage URL:</strong> https://yourdomain.com
                  </li>
                  <li>
                    • <strong>Callback URL:</strong>{" "}
                    https://auth.yourdomain.com/callback.html
                  </li>
                </ul>
                <p>4. Copy the Client ID and Client Secret</p>
              </div>
            </div>
          </Step>

          <Step
            number={2}
            title="Google OAuth"
            description="Set up Google OAuth credentials (optional)."
            icon={Globe}
          >
            <div className="rounded-lg bg-white/5 border border-white/5 p-4 text-sm text-gray-300 space-y-2">
              <p>
                1. Go to{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  className="text-violet-400 hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
              <p>2. Create a new OAuth 2.0 Client ID</p>
              <p>3. Set the redirect URI to your callback URL</p>
              <p>4. Copy the Client ID and Client Secret</p>
            </div>
          </Step>

          <Step
            number={3}
            title="Configure Auth Page"
            description="Update the static auth page with your credentials."
            icon={Terminal}
          >
            <CodeBlock
              language="html"
              code={`<!-- In Deployer-auth-page/index.html -->
<script>
  const BACKEND_URL = 'https://api.yourdomain.com';
  const CLI_CALLBACK_URL = 'http://localhost:5000/auth/callback';
  
  // In handleOAuth():
  const clientId = provider === 'github' 
    ? 'your-github-client-id' 
    : 'your-google-client-id';
</script>

<!-- In Deployer-auth-page/callback.html -->
<script>
  const BACKEND_URL = 'https://api.yourdomain.com';
</script>`}
            />
          </Step>

          <Step
            number={4}
            title="Host the Auth Page"
            description="Serve the auth page via any static hosting solution."
            icon={Globe}
          >
            <CodeBlock
              code={`# Simple local testing
cd Deployer-auth-page
python3 -m http.server 3000

# Or deploy to your K8s cluster / Nginx
# The page just needs to be accessible at your AUTH_PAGE_URL`}
            />
          </Step>
        </div>
      )}
    </div>
  );
}
