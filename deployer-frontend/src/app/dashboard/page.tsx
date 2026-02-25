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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-36 min-h-screen text-white font-sans bg-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.4)] mb-2">DASHBOARD</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-bold">
            {projects.length} project{projects.length !== 1 ? "s" : ""} deployed
          </p>
        </div>
        <Link
          href="/setup"
          className="flex items-center gap-3 px-6 py-4 rounded-sm bg-[#00e5ff] text-black text-xs font-black tracking-widest uppercase hover:bg-white hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all"
        >
          <Plus className="w-4 h-4" />
          NEW DEPLOYMENT
        </Link>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="SEARCH PROJECTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 pl-12 pr-6 py-4 rounded-sm bg-[#050505] border border-[#222] text-sm text-white placeholder-gray-600 font-bold tracking-widest uppercase focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/20 transition-all shadow-inner"
          />
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-sm border border-[#222] bg-[#0a0a0a] p-6 hover:bg-[#111] hover:border-[#444] transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff] rounded-full blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
                <div className="flex items-center gap-6 min-w-0">
                  <div className="w-14 h-14 rounded-sm bg-[#00e5ff]/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-[#00e5ff]" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/${project.id}`}
                      className="flex items-center gap-3 group/link mb-2"
                    >
                      <h3 className="text-2xl font-black text-white uppercase tracking-wide truncate group-hover/link:text-[#00e5ff] transition-colors">
                        {project.name}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover/link:text-[#00e5ff] transition-colors" />
                    </Link>
                    <div className="flex items-center gap-4">
                      <a
                        href={getProjectUrl(project.name)}
                        target="_blank"
                        className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#00e5ff] hover:text-white transition-colors uppercase"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {project.name}.dsingh.fun
                      </a>
                      <span className="text-xs text-gray-700">•</span>
                      <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                        {timeAgo(project.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 border border-[#00e5ff]/30 rounded-sm bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-black tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
                    ONLINE
                  </span>

                  {deleteConfirm === project.id ? (
                    <div className="flex items-center gap-3 animate-fade-in">
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting}
                        className="px-4 py-2 rounded-sm border border-red-500 text-red-500 text-xs font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {deleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "CONFIRM"
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 rounded-sm bg-[#222] text-white text-xs font-black tracking-widest uppercase hover:bg-[#333] transition-all"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(project.id)}
                      className="p-3 rounded-sm text-gray-600 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all z-20 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-24 border border-[#222] rounded-sm bg-[#050505]">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-6" />
          <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">NO PROJECTS MATCHING &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="text-center py-32 border border-[#222] rounded-sm bg-[#050505]">
          <div className="inline-flex p-6 rounded-sm bg-[#111] border border-[#222] mb-8">
            <FolderOpen className="w-16 h-16 text-[#00e5ff]" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">NO PROJECTS YET</h2>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-10 max-w-md mx-auto leading-relaxed">
            Deploy your first full-stack application using the core CLI. Initiated in seconds.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-sm bg-[#00e5ff] text-black font-black tracking-widest uppercase hover:bg-white hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all"
          >
            <Rocket className="w-5 h-5" />
            INITIALIZE DEPLOYMENT
          </Link>
        </div>
      )}
    </div>
  );
}
