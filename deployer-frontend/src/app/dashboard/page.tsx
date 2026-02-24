"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listProjects, deleteProject, type Project } from "@/lib/api";
import { timeAgo, getProjectUrl } from "@/lib/utils";
import {
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  Rocket,
  Search,
  Globe,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  async function loadProjects() {
    try {
      const data = await listProjects();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    setDeleting(true);
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(false);
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} deployed
          </p>
        </div>
        <Link
          href="/setup"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Deployment
        </Link>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg bg-surface-secondary border border-surface-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl glass glass-hover p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/${project.id}`}
                      className="flex items-center gap-2 group/link"
                    >
                      <h3 className="font-semibold text-white truncate group-hover/link:text-violet-400 transition-colors">
                        {project.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover/link:text-violet-400 transition-colors" />
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={getProjectUrl(project.name)}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {project.name}.dsingh.fun
                      </a>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        {timeAgo(project.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Ready
                  </span>

                  {deleteConfirm === project.id ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        {deleting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(project.id)}
                      className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No projects matching &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-6">
            <FolderOpen className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">No projects yet</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
            Deploy your first static site using the CLI. It only takes a minute.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:from-violet-500 hover:to-pink-500 transition-all"
          >
            <Rocket className="w-4 h-4" />
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
