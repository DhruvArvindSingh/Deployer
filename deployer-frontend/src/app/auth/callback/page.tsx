"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { handleOAuthCallback } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    // Determine provider from state param or guess from code format
    let provider = state || "";
    if (!provider) {
      provider = code.startsWith("4/") ? "google" : "github";
    }

    handleOAuthCallback(provider, code)
      .then((data) => {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        login(data.token, {
          id: payload.user_id,
          email: data.email || payload.email,
          username: payload.username || data.email?.split("@")[0] || "",
          provider: provider,
          created_at: new Date().toISOString(),
        });
        router.push("/dashboard");
      })
      .catch((err) => {
        setError(err.message || "Authentication failed");
      });
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-10 max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✗</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-all"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-4" />
        <p className="text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
