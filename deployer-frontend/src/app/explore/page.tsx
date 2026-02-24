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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-7 h-7 text-violet-400" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>
        <p className="text-gray-400 mt-1">
          Discover what the community is building and deploying with DeployNet
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Globe className="w-3.5 h-3.5" />
            Total Projects
          </div>
          <p className="text-2xl font-bold">{totalProjects}</p>
        </div>
        <div className="rounded-xl glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Rocket className="w-3.5 h-3.5" />
            Total Deployments
          </div>
          <p className="text-2xl font-bold">{totalDeployments}</p>
        </div>
        <div className="rounded-xl glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <User className="w-3.5 h-3.5" />
            Developers
          </div>
          <p className="text-2xl font-bold">{uniqueUsers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search projects or developers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 pl-10 pr-4 py-2.5 rounded-lg bg-surface-secondary border border-surface-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl glass glass-hover p-5 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-violet-400" />
                </div>
                <a
                  href={getProjectUrl(project.name)}
                  target="_blank"
                  className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <h3 className="font-semibold text-white mb-1">{project.name}</h3>
              <a
                href={getProjectUrl(project.name)}
                target="_blank"
                className="text-xs text-gray-500 hover:text-violet-400 transition-colors"
              >
                {project.name}.dsingh.fun
              </a>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {project.username?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-xs text-gray-400">
                  {project.username || "Anonymous"}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  {project.deployment_count || 0} deploy
                  {(project.deployment_count || 0) !== 1 ? "s" : ""}
                </div>
                {project.last_deployed && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {timeAgo(project.last_deployed)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Compass className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-1">
            {search ? "No results found" : "No projects yet"}
          </h2>
          <p className="text-gray-500 text-sm">
            {search
              ? `Nothing matches "${search}"`
              : "Be the first to deploy on DeployNet!"}
          </p>
        </div>
      )}
    </div>
  );
}
