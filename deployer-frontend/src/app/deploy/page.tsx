"use client";

import { useState } from "react";
import {
    Terminal,
    Download,
    LogIn,
    Rocket,
    Globe,
    Copy,
    Check,
    Layout,
    Star,
    Server
} from "lucide-react";
import Link from "next/link";

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

export default function DeployPage() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-8 pt-36 min-h-screen text-white font-sans bg-black">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#00e5ff]/10 text-[#00e5ff] rounded-sm">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">DEPLOY TO THE HOMELAB</h1>
                </div>
                <p className="text-gray-400 text-lg tracking-wide uppercase font-light">
                    SHIP YOUR STATIC SITES DIRECTLY TO <span className="text-white font-medium">MY PERSONAL HOMELAB SERVER</span> IN SECONDS.
                </p>
            </div>

            <div className="mb-16 border-l-4 border-[#00e5ff] bg-[#00e5ff]/5 p-6 rounded-r-sm max-w-4xl">
                <h3 className="text-[#00e5ff] text-xl font-black uppercase tracking-widest mb-2 flex items-center gap-3">
                    <Server className="w-5 h-5" />
                    COMMUNITY-DRIVEN HOSTING
                </h3>
                <p className="text-gray-400 text-sm font-bold tracking-widest uppercase leading-relaxed">
                    THIS PLATFORM ALLOWS <span className="text-white">ANYONE</span> TO LEVERAGE MY HARDWARE. BY USING THE DEPLOYER CLI, YOU ARE UPLOADING AND HOSTING YOUR PROJECTS DIRECTLY ON MY KUBERNETES AND MINIO CLUSTER INFRASTRUCTURE, EXPOSED TO THE WORLD VIA <span className="text-white">*.DSINGH.FUN</span>
                </p>
            </div>

            <div className="animate-fade-in space-y-4">
                {/* Step 1 */}
                <Step
                    number={1}
                    title="INSTALL & VERIFY CLI"
                    description="MAKE SURE YOU HAVE THE LATEST DEPLOYER BINARY ON YOUR SYSTEM AND IT'S ADDED TO YOUR PATH."
                    icon={Download}
                >
                    <CodeBlock
                        code={`# Confirm installation
deployer --version

# If not installed, get it via Homebrew or install script:
curl -sL https://github.com/DhruvArvindSingh/Deployer | bash`}
                    />
                </Step>

                {/* Step 2 */}
                <Step
                    number={2}
                    title="AUTHENTICATE YOUR MACHINE"
                    description="LOG IN TO DEPLOYER SO YOUR CLI IS SECURELY LINKED TO YOUR ACCOUNT."
                    icon={LogIn}
                >
                    <CodeBlock
                        code={`deployer login

# Follow the browser prompt to auth with GitHub or Google
# Paste your secure token back in the terminal
# You are now authenticated!`}
                    />
                </Step>

                {/* Step 3 */}
                <Step
                    number={3}
                    title="NAVIGATE TO YOUR PROJECT"
                    description="OPEN THE DIRECTORY OF YOUR NEXT.JS, VITE, OR REACT APPLICATION."
                    icon={Layout}
                >
                    <CodeBlock
                        code={`# Change into your project's root folder
cd ~/my-awesome-startup

# Let's verify we are in the right place
ls -la`}
                    />
                    <div className="mt-4 rounded-sm bg-[#0a0a0a] border border-[#222] p-6">
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase leading-relaxed">
                            THE CLI AUTO-DETECTS MOST FRAMEWORKS BY LOOKING AT YOUR <span className="text-white">PACKAGE.JSON</span>
                            OR BUILD CONFIGURATIONS (E.G., NEXT.CONFIG.JS, VITE.CONFIG.TS).
                        </p>
                    </div>
                </Step>

                {/* Step 4 */}
                <Step
                    number={4}
                    title="EXECUTE THE DEPLOYMENT"
                    description="RUN THE DEPLOYMENT PROCESS. THE CLI WILL HANDLE BUILDING AND UPLOADING AUTOMATICALLY."
                    icon={Terminal}
                >
                    <CodeBlock
                        code={`deployer deploy`}
                    />
                    <div className="mt-4 rounded-sm bg-[#00e5ff]/5 border border-[#00e5ff]/30 p-6">
                        <p className="text-xs font-bold tracking-widest text-[#00e5ff] uppercase leading-relaxed">
                            DURING THIS STEP, YOU WILL BE PROMPTED TO <span className="text-white drop-shadow-[0_0_5px_#fff]">ENTER YOUR PREFERRED DOMAIN NAME</span>.
                            THIS IDENTIFIER WILL BE USED TO GENERATE YOUR PERMANENT URL!
                        </p>
                    </div>
                </Step>

                {/* Step 5 */}
                <Step
                    number={5}
                    title="CHOOSE YOUR DOMAIN"
                    description="A UNIQUE SUBDOMAIN WILL BE GENERATED FOR YOUR PROJECT IN REAL-TIME."
                    icon={Globe}
                >
                    <CodeBlock
                        code={`> What should your project be called?
> my-first-app

ℹ Project name available!
ℹ Detected Next.js project
✓ Build completed successfully [12.4s]
✓ Uploading build artifacts to CDN...
✓ Created deployment v1

🚀 Deployment Successful!
  URL: https://my-first-app.dsingh.fun`}
                    />
                    <div className="mt-4 rounded-sm bg-[#0a0a0a] border border-[#222] p-6 space-y-4">
                        <h4 className="text-[#00e5ff] font-black uppercase tracking-widest flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            SUCCESSFUL ATTACHMENT
                        </h4>
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase leading-relaxed">
                            EVERY SUCCESSFUL DEPLOYMENT IS IMMEDIATELY BROADCAST ACCESSIBLE GLOBALLY VIA:
                        </p>
                        <div className="bg-black border border-[#222] px-4 py-3 rounded-sm">
                            <code className="text-[#00e5ff] text-sm overflow-x-auto whitespace-nowrap block text-center font-bold tracking-widest">
                                HTTPS://&lt;YOUR-DOMAIN-NAME&gt;.DSINGH.FUN
                            </code>
                        </div>
                    </div>
                </Step>
            </div>

            <div className="mt-8 mb-16 flex items-center justify-center pt-8 border-t border-[#222]">
                <Link
                    href="/dashboard"
                    className="group relative flex items-center justify-center gap-4 px-10 py-5 bg-[#00e5ff] text-black font-black tracking-widest uppercase hover:bg-white transition-all rounded-sm shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                >
                    VIEW YOUR DASHBOARD
                </Link>
            </div>
        </div>
    );
}
