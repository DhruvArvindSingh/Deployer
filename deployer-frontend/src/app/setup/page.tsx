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
    <div className="relative group rounded-sm bg-[#050505] border border-[#222] overflow-hidden mt-6 mb-8">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#0a0a0a]">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-[#00e5ff] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#00e5ff]" />
              <span className="text-[#00e5ff]">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              COPY
            </>
          )}
        </button>
      </div>
      <pre className="p-6 overflow-x-auto">
        <code className="text-sm font-mono text-[#00e5ff] opacity-80">{code}</code>
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
    <div className="relative pl-14 pb-16 last:pb-0">
      {/* Connector line */}
      <div className="absolute left-[20px] top-12 bottom-0 w-[2px] bg-gradient-to-b from-[#00e5ff]/30 to-transparent last:hidden" />

      {/* Step number */}
      <div className="absolute left-0 top-1 w-10 h-10 rounded-sm bg-[#00e5ff] flex items-center justify-center text-sm font-black text-black tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.4)]">
        0{number}
      </div>

      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-sm bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] border border-[#00e5ff]/30">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-widest">{title}</h3>
        </div>
        <p className="text-sm font-bold tracking-widest text-gray-400 uppercase leading-relaxed mb-6">{description}</p>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<"cli" | "backend" | "auth">("cli");

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pt-36 min-h-screen text-white font-sans bg-black">
      {/* Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[#00e5ff]/10 text-[#00e5ff] rounded-sm">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">SETUP GUIDE</h1>
        </div>
        <p className="text-gray-400 text-lg tracking-wide uppercase font-light">
          Get started deploying applications to <span className="text-white font-medium">Deployer</span> in minutes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-sm bg-[#050505] border border-[#222] mb-16 w-fit">
        {[
          { id: "cli" as const, label: "CLI SETUP", icon: Terminal },
          { id: "backend" as const, label: "BACKEND SETUP", icon: Server },
          { id: "auth" as const, label: "AUTH SETUP", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-sm text-xs font-black tracking-widest transition-all",
                activeTab === tab.id
                  ? "bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "text-gray-500 hover:text-white hover:bg-[#111]"
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
        <div className="animate-fade-in space-y-4">
          <Step
            number={1}
            title="INSTALL THE CLI"
            description="QUICK INSTALL FROM GITHUB OR BUILD FROM SOURCE."
            icon={Download}
          >
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-[#00e5ff] font-black tracking-[0.2em] mb-4">OPTION A: QUICK INSTALL (GITHUB DIRECT)</p>
                <CodeBlock
                  code={`curl -sL https://raw.githubusercontent.com/DhruvArvindSingh/Deployer/master/deployer-frontend/public/install.sh | bash`}
                />
                <p className="mt-2 text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                  This script automatically detects your OS/Arch and downloads the latest binary from GitHub Releases.
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] mb-4">OPTION B: DOWNLOAD BINARY MANUALLY</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <a 
                    href="https://github.com/DhruvArvindSingh/Deployer/releases/latest" 
                    target="_blank"
                    className="px-4 py-2 border border-[#222] bg-[#0a0a0a] text-[10px] font-black tracking-widest uppercase hover:border-[#00e5ff] hover:text-[#00e5ff] transition-all"
                  >
                    View All Releases
                  </a>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] mb-4">OPTION C: BUILD FROM SOURCE</p>
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
              </div>
            </div>
          </Step>

          <Step
            number={2}
            title="AUTHENTICATE"
            description="LOG IN WITH YOUR GITHUB OR GOOGLE ACCOUNT VIA THE BROWSER."
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
            <div className="mt-4 rounded-sm bg-[#0a0a0a] border border-[#222] p-6">
              <p className="text-xs font-bold tracking-widest text-[#00e5ff] uppercase leading-relaxed">
                <span className="text-white">TIP:</span> YOUR TOKEN IS VALID FOR 30 DAYS. RUN{" "}
                <code className="px-2 py-1 mx-1 rounded-sm bg-black border border-[#222] text-[#00e5ff]">
                  deployer login
                </code>{" "}
                AGAIN WHEN IT EXPIRES.
              </p>
            </div>
          </Step>

          <Step
            number={3}
            title="DEPLOY YOUR PROJECT"
            description="NAVIGATE TO YOUR PROJECT DIRECTORY AND DEPLOY WITH A SINGLE COMMAND."
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
            title="CONFIGURE CI/CD"
            description="AUTO-DEPLOY YOUR PROJECT ON EVERY PUSH WITH GITHUB ACTIONS."
            icon={Zap}
          >
            <CodeBlock
              code={`# Run setup inside your project directory
deployer setup

# This will:
# 1. Detect your git repository
# 2. Generate .github/workflows/deploy.yml
# 3. Configure the subdirectory (for monorepos)
#
# ✓ Action created! Just add DEPLOYER_TOKEN to GitHub Secrets.`}
            />
          </Step>

          <Step
            number={5}
            title="MANAGE DEPLOYMENTS"
            description="LIST, CHECK STATUS, OR DELETE YOUR DEPLOYED PROJECTS."
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
          <div className="mt-12 rounded-sm border border-[#222] bg-[#050505] p-8">
            <h3 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-[#00e5ff]/10 text-[#00e5ff] rounded-sm">
                <Zap className="w-5 h-5" />
              </div>
              SUPPORTED FRAMEWORKS
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
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
                  className="rounded-sm bg-[#0a0a0a] p-6 border border-[#222] hover:border-[#444] transition-all"
                >
                  <h4 className="font-black text-lg uppercase tracking-widest mb-4">{fw.name}</h4>
                  <div className="space-y-4">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400">
                      <span className="text-[#00e5ff] block mb-1">DETECTS</span>{" "}
                      {fw.detect}
                    </p>
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400">
                      <span className="text-[#00e5ff] block mb-1">UPLOADS</span>{" "}
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
        <div className="animate-fade-in space-y-4">
          <Step
            number={1}
            title="PREREQUISITES"
            description="MAKE SURE YOU HAVE THE FOLLOWING INSTALLED ON YOUR SERVER."
            icon={Server}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Go 1.22+",
                "PostgreSQL",
                "MinIO (S3-compatible storage)",
                "Kubernetes (K3s recommended)",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 px-6 py-4 rounded-sm bg-[#0a0a0a] border border-[#222] text-sm font-bold tracking-widest uppercase hover:border-[#00e5ff]/50 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-[#00e5ff]" />
                  {item}
                </div>
              ))}
            </div>
          </Step>

          <Step
            number={2}
            title="CLONE & CONFIGURE"
            description="CLONE THE REPOSITORY AND SET UP YOUR ENVIRONMENT VARIABLES."
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
DATABASE_URL=postgresql://user:pass@localhost:5432/deployer
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
            title="RUN THE BACKEND"
            description="BUILD AND START THE BACKEND SERVER."
            icon={Rocket}
          >
            <CodeBlock
              code={`# Install dependencies
go mod download

# Run directly
go run main.go

# Or build a binary
go build -o deployer-backend
./deployer-backend

# Server starts at http://localhost:8080
# ✅ Connected to database
# ✅ Connected to MinIO
# ✅ Database migrations completed
# 🚀 Server starting on port 8080`}
            />
          </Step>

          <Step
            number={4}
            title="VERIFY"
            description="MAKE SURE EVERYTHING IS WORKING."
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
        <div className="animate-fade-in space-y-4">
          <Step
            number={1}
            title="GITHUB OAUTH APP"
            description="CREATE A GITHUB OAUTH APPLICATION FOR AUTHENTICATION."
            icon={Shield}
          >
            <div className="space-y-4">
              <div className="rounded-sm bg-[#0a0a0a] border border-[#222] p-6 text-sm text-gray-400 font-bold tracking-widest uppercase space-y-4">
                <p>
                  1. GO TO{" "}
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    className="text-[#00e5ff] hover:text-white transition-colors"
                  >
                    GITHUB DEVELOPER SETTINGS
                  </a>
                </p>
                <p>2. CLICK &quot;NEW OAUTH APP&quot;</p>
                <p>3. FILL IN:</p>
                <ul className="ml-6 space-y-2 text-gray-500">
                  <li>
                    • <strong className="text-white">APP NAME:</strong> DEPLOYER
                  </li>
                  <li>
                    • <strong className="text-white">HOMEPAGE URL:</strong> HTTPS://YOURDOMAIN.COM
                  </li>
                  <li>
                    • <strong className="text-white">CALLBACK URL:</strong>{" "}
                    HTTPS://AUTH.YOURDOMAIN.COM/CALLBACK.HTML
                  </li>
                </ul>
                <p>4. COPY THE CLIENT ID AND CLIENT SECRET</p>
              </div>
            </div>
          </Step>

          <Step
            number={2}
            title="GOOGLE OAUTH"
            description="SET UP GOOGLE OAUTH CREDENTIALS (OPTIONAL)."
            icon={Globe}
          >
            <div className="rounded-sm bg-[#0a0a0a] border border-[#222] p-6 text-sm text-gray-400 font-bold tracking-widest uppercase space-y-4">
              <p>
                1. GO TO{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  className="text-[#00e5ff] hover:text-white transition-colors"
                >
                  GOOGLE CLOUD CONSOLE
                </a>
              </p>
              <p>2. CREATE A NEW OAUTH 2.0 CLIENT ID</p>
              <p>3. SET THE REDIRECT URI TO YOUR CALLBACK URL</p>
              <p>4. COPY THE CLIENT ID AND CLIENT SECRET</p>
            </div>
          </Step>

          <Step
            number={3}
            title="CONFIGURE AUTH PAGE"
            description="UPDATE THE STATIC AUTH PAGE WITH YOUR CREDENTIALS."
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
            title="HOST THE AUTH PAGE"
            description="SERVE THE AUTH PAGE VIA ANY STATIC HOSTING SOLUTION."
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
