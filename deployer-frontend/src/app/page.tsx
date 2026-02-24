"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Zap,
  ArrowRight,
  Globe,
  Shield,
  Terminal,
  Rocket,
  Github,
  Server,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative">
      {/* Hero gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/20 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-300 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Self-hosted • Open Source • Your Infrastructure
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Deploy to your
            <br />
            <span className="text-gradient">homelab instantly</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up">
            Ship static sites to your own infrastructure with a single command.
            Next.js, Vite, React — detected automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all hover:shadow-lg hover:shadow-white/10"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/setup"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl glass glass-hover font-semibold"
            >
              <Terminal className="w-4 h-4" />
              View Setup Guide
            </Link>
          </div>

          {/* Terminal preview */}
          <div className="mt-16 max-w-2xl mx-auto animate-fade-in">
            <div className="rounded-xl glass glow overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-gray-500">Terminal</span>
              </div>
              <div className="p-6 font-mono text-sm text-left">
                <div className="text-gray-500">
                  # Install and deploy in seconds
                </div>
                <div className="mt-2">
                  <span className="text-emerald-400">$</span>{" "}
                  <span className="text-white">deployer login</span>
                </div>
                <div className="text-gray-500 mt-1">
                  ✓ Authentication successful!
                </div>
                <div className="mt-3">
                  <span className="text-emerald-400">$</span>{" "}
                  <span className="text-white">deployer deploy</span>
                </div>
                <div className="text-gray-500 mt-1">
                  ℹ Detected Next.js project
                </div>
                <div className="text-gray-500">✓ Build completed</div>
                <div className="text-gray-500">✓ Uploaded 42 files (2.1 MB)</div>
                <div className="mt-2 text-emerald-400">
                  🚀 Live at https://my-site.dsingh.fun
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything you need to deploy
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Built for developers who prefer owning their infrastructure without
            sacrificing developer experience.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Rocket,
                title: "One Command Deploy",
                desc: "Run `deployer deploy` and your site is live. Auto-detects Next.js, Vite, and CRA.",
              },
              {
                icon: Shield,
                title: "Secure by Default",
                desc: "JWT auth, OAuth with GitHub & Google, bucket isolation. Your data stays on your servers.",
              },
              {
                icon: Globe,
                title: "Custom Domains",
                desc: "Every project gets a subdomain automatically. Configure custom domains with a click.",
              },
              {
                icon: Server,
                title: "Self-Hosted",
                desc: "Runs on K3s, Docker, or any Kubernetes cluster. You own everything.",
              },
              {
                icon: Terminal,
                title: "Powerful CLI",
                desc: "Deploy, list, delete, rollback — all from your terminal. Zero browser required.",
              },
              {
                icon: Github,
                title: "Open Source",
                desc: "MIT licensed. Inspect every line, contribute, or fork it. Your platform, your rules.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl glass glass-hover group cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:from-violet-500/30 group-hover:to-pink-500/30 transition-all">
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-12 rounded-2xl glass glow">
            <Zap className="w-12 h-12 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to deploy?
            </h2>
            <p className="text-gray-400 mb-8">
              Get your homelab deployment pipeline running in under 5 minutes.
            </p>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:from-violet-500 hover:to-pink-500 transition-all hover:shadow-lg hover:shadow-violet-500/20"
            >
              {isAuthenticated ? "Open Dashboard" : "Sign Up Free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Zap className="w-4 h-4 text-violet-500" />
            DeployNet — Built by Dhruv Singh
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/DhruvArvindSingh/Deployer"
              target="_blank"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="/setup"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/explore"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
