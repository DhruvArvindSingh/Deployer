"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { timeAgo, getProjectUrl } from "@/lib/utils";
import {
  Compass,
  ExternalLink,
  Rocket,
  User,
  Search,
  Globe,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";

interface ExploreProject {
  id: string;
  name: string;
  username: string;
  email: string;
  deployment_count: number;
  last_deployed: string;
  total_files: number;
  total_size: number;
}

export default function ExplorePage() {
  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadExplore();
  }, []);

  async function loadExplore() {
    try {
      const res = await fetch(`${API_BASE}/api/explore`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
      }
    } catch (err) {
      console.error("Failed to load explore:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalDeployments = projects.reduce(
    (sum, p) => sum + (p.deployment_count || 0),
    0
  );
  const totalProjects = projects.length;
  const uniqueUsers = new Set(projects.map((p) => p.email)).size;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-36 min-h-screen text-white font-sans bg-black">
      {/* Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[#00e5ff]/10 text-[#00e5ff] rounded-sm">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">EXPLORE</h1>
        </div>
        <p className="text-gray-400 text-lg tracking-wide uppercase font-light">
          Discover what the community is building on <span className="text-white font-medium">Deployer</span>.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="rounded-sm border border-[#222] bg-[#050505] p-6 hover:border-[#444] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-center gap-3 text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Globe className="w-4 h-4 text-[#00e5ff]" />
            Total Projects
          </div>
          <p className="text-5xl font-black">{totalProjects}</p>
        </div>
        <div className="rounded-sm border border-[#222] bg-[#050505] p-6 hover:border-[#444] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-center gap-3 text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Rocket className="w-4 h-4 text-[#00e5ff]" />
            Deployments
          </div>
          <p className="text-5xl font-black">{totalDeployments}</p>
        </div>
        <div className="rounded-sm border border-[#222] bg-[#050505] p-6 hover:border-[#444] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-center gap-3 text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
            <User className="w-4 h-4 text-[#00e5ff]" />
            Developers
          </div>
          <p className="text-5xl font-black">{uniqueUsers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="SEARCH PROJECTS OR DEVELOPERS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-sm bg-[#050505] border border-[#222] text-sm text-white placeholder-gray-600 font-bold tracking-widest uppercase focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/20 transition-all shadow-inner"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff]" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-sm border border-[#222] bg-[#0a0a0a] p-6 hover:bg-[#111] hover:border-[#444] hover:shadow-[0_0_30px_rgba(0,229,255,0.05)] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff] rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-[#00e5ff]/10 text-[#00e5ff]">
                  <Globe className="w-5 h-5" />
                </div>
                <a
                  href={getProjectUrl(project.name)}
                  target="_blank"
                  className="p-2 text-gray-600 hover:text-[#00e5ff] transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">{project.name}</h3>
              <a
                href={getProjectUrl(project.name)}
                target="_blank"
                className="text-xs text-[#00e5ff] hover:text-white transition-colors tracking-widest truncate block"
              >
                {project.name}.dsingh.fun
              </a>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#222]">
                <div className="w-8 h-8 rounded-sm bg-gray-900 border border-[#333] flex items-center justify-center text-xs font-black text-white">
                  {project.username?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                  {project.username || "Anonymous"}
                </span>
              </div>

              <div className="flex items-center justify-between mt-6 text-xs font-bold text-gray-500 tracking-widest uppercase">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {project.deployment_count || 0} deploys
                </div>
                {project.last_deployed && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {timeAgo(project.last_deployed)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border border-[#222] rounded-sm bg-[#050505]">
          <Compass className="w-16 h-16 text-[#00e5ff]/40 mx-auto mb-6" />
          <h2 className="text-2xl font-black tracking-widest uppercase mb-4 text-white">
            {search ? "No results found" : "No projects yet"}
          </h2>
          <p className="text-gray-500 text-sm tracking-widest uppercase font-bold">
            {search
              ? `Nothing matches "${search}"`
              : "Be the first to deploy on Deployer!"}
          </p>
        </div>
      )}
    </div>
  );
}
