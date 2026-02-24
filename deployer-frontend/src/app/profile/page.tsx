"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { setStoredUser } from "@/lib/api";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Camera,
  Github,
  Loader2,
  Save,
  LogOut,
  Globe,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.username || "");
      // Load extended profile from localStorage
      const profile = localStorage.getItem("deploynet_profile");
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          setBio(parsed.bio || "");
          setWebsite(parsed.website || "");
          setAvatarPreview(parsed.avatar || null);
        } catch {}
      }
    }
  }, [user]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Save extended profile to localStorage
      const profile = {
        bio,
        website,
        avatar: avatarPreview,
        displayName,
      };
      localStorage.setItem("deploynet_profile", JSON.stringify(profile));

      // Update stored user
      if (user) {
        setStoredUser({ ...user, username: displayName });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="rounded-xl glass p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Avatar
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "?"}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg glass glass-hover text-sm font-medium"
              >
                Upload Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="rounded-xl glass p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                <User className="w-3.5 h-3.5" />
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-secondary border border-surface-border text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-surface-secondary/50 border border-surface-border text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">
                Email is tied to your OAuth provider
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                <Globe className="w-3.5 h-3.5" />
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-secondary border border-surface-border text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                placeholder="https://your-site.com"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-secondary border border-surface-border text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Save className="w-4 h-4 text-emerald-500" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Account Info */}
        <div className="rounded-xl glass p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4" />
                Auth Provider
              </div>
              <span className="flex items-center gap-1.5 text-sm font-medium capitalize">
                {user?.provider === "github" && (
                  <Github className="w-4 h-4" />
                )}
                {user?.provider || "OAuth"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                Member Since
              </div>
              <span className="text-sm font-medium">
                {user?.created_at
                  ? formatDate(user.created_at)
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 p-6">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Log out of your account. Your deployments will remain active.
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
