"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-1">
            <span className="text-2xl md:text-3xl font-black tracking-[0.1em] text-[#d6f8e8] uppercase">
              Deployer
            </span>
          </Link>

          {/* Navigation Links - Centered */}
          <div className="hidden lg:flex items-center justify-center gap-12 text-sm text-white font-medium tracking-widest uppercase flex-1">
            <Link href="/dashboard" className="hover:text-[#d6f8e8] transition-colors">Dashboard</Link>
            <Link href="/explore" className="hover:text-[#d6f8e8] transition-colors">Explore</Link>
            <Link href="/setup" className="hover:text-[#d6f8e8] transition-colors">Setup</Link>
            <Link href="/deploy" className="hover:text-[#d6f8e8] transition-colors">Deploy</Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-6 flex-1">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <span className="text-xs text-indigo-200 tracking-widest uppercase hidden md:block">{user?.username || user?.email}</span>
                <button onClick={logout} className="text-xs text-red-300 uppercase tracking-widest font-semibold hover:text-red-400 transition-colors">
                  Logout
                </button>
                <Link
                  href="/dashboard"
                  className="hidden sm:block px-6 py-2 border border-white/40 text-xs text-white font-semibold tracking-widest uppercase hover:bg-white hover:text-[#2B285E] transition-all"
                >
                  DASHBOARD
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="hidden sm:block text-xs text-white uppercase tracking-widest font-semibold hover:text-[#d6f8e8] transition-colors">
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-2.5 border border-white/60 text-xs text-white font-semibold tracking-widest uppercase hover:bg-white hover:text-[#2B285E] transition-all"
                >
                  GET STARTED
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
