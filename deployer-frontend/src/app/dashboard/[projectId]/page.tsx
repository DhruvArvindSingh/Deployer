"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getProject, type Project, type Deployment, API_BASE } from "@/lib/api";
import {
  cn,
  timeAgo,
  formatDate,
  formatBytes,
  getProjectUrl,
} from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Clock,
  FileText,
  HardDrive,
  Loader2,
  RotateCcw,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Rocket,
  AlertTriangle,
  Hash,
  CheckCircle2,
} from "lucide-react";

export default function ProjectDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDeploy, setExpandedDeploy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rollbackConfirm, setRollbackConfirm] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && projectId) {
      loadProjectData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, projectId]);

  async function loadProjectData() {
    try {
      const projectData = await getProject(projectId);
      setProject(projectData);

      // Load deployments
      const token = localStorage.getItem("deploynet_token");
      const res = await fetch(
        `${API_BASE}/api/projects/${projectId}/deployments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const deps = await res.json();
        setDeployments(deps || []);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    if (!project) return;
    navigator.clipboard.writeText(getProjectUrl(project.name));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRollback(deploymentId: string) {
    setRollingBack(true);
    try {
      const token = localStorage.getItem("deploynet_token");
      const res = await fetch(
        `${API_BASE}/api/projects/${projectId}/rollback/${deploymentId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        // Reload project data to reflect the new active deployment
        await loadProjectData();
        setRollbackConfirm(null);
      } else {
        const error = await res.json();
        alert(`Rollback failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Rollback failed:", err);
      alert("Rollback failed. Check console for details.");
    } finally {
      setRollingBack(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-6">PROJECT NOT FOUND</h2>
        <Link
          href="/dashboard"
          className="px-8 py-4 border-2 border-[#00e5ff] text-[#00e5ff] font-black uppercase tracking-widest hover:bg-[#00e5ff] hover:text-black transition-all"
        >
          BACK TO DASHBOARD
        </Link>
      </div>
    );
  }

  const activeDeployment = deployments.find((d) => d.is_active);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-36 min-h-screen text-white font-sans bg-black">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-3 text-sm text-gray-400 font-bold uppercase tracking-widest hover:text-[#00e5ff] transition-colors mb-10"
      >
        <ArrowLeft className="w-5 h-5" />
        BACK TO PROJECTS
      </Link>

      {/* Project Header */}
      <div className="rounded-sm border border-[#222] bg-[#050505] p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-sm bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/30">
              <Globe className="w-8 h-8 text-[#00e5ff]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide mb-2 drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]">{project.name}</h1>
              <div className="flex items-center gap-4">
                <a
                  href={getProjectUrl(project.name)}
                  target="_blank"
                  className="flex items-center gap-2 text-sm text-[#00e5ff] font-bold tracking-widest hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {project.name}.dsingh.fun
                </a>
                <button
                  onClick={copyUrl}
                  className="p-2 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold tracking-widest text-xs flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#00e5ff]" />
                      <span className="text-[#00e5ff]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          {activeDeployment && (
            <span className="inline-flex items-center gap-2 px-4 py-2 border border-[#00e5ff]/30 rounded-sm bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
              V{activeDeployment.version} LIVE
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-[#222] relative z-10">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">STATUS</p>
            <p className="text-lg font-black text-[#00e5ff] uppercase">ACTIVE</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">CREATED</p>
            <p className="text-lg font-black uppercase">{formatDate(project.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">VERSIONS</p>
            <p className="text-lg font-black">{deployments.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">ACTIVE VERSION</p>
            <p className="text-lg font-black flex items-center gap-2 uppercase">
              <Hash className="w-5 h-5 text-[#00e5ff]" />
              {activeDeployment ? `V${activeDeployment.version}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Deployments */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-[#00e5ff]/10 text-[#00e5ff] rounded-sm">
          <Rocket className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest">DEPLOYMENT HISTORY</h2>
      </div>

      {deployments.length > 0 ? (
        <div className="space-y-4">
          {deployments.map((deploy) => (
            <div
              key={deploy.id}
              className={cn(
                "rounded-sm border border-[#222] bg-[#0a0a0a] transition-all overflow-hidden group/item",
                deploy.is_active && "border-[#00e5ff]/50 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
              )}
            >
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer hover:bg-[#111] transition-all relative"
                onClick={() =>
                  setExpandedDeploy(
                    expandedDeploy === deploy.id ? null : deploy.id
                  )
                }
              >
                <div className="flex items-center gap-6">
                  <span
                    className={cn(
                      "w-3 h-3 rounded-full",
                      deploy.status === "success" ? "bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]"
                        : deploy.status === "failed" ? "bg-red-500 shadow-[0_0_10px_#f00]"
                          : "bg-yellow-500 shadow-[0_0_10px_#ff0]"
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xl font-black uppercase tracking-wide">
                        V{deploy.version}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-black tracking-widest uppercase px-3 py-1 rounded-sm border",
                          deploy.status === "success"
                            ? "bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]"
                            : deploy.status === "failed"
                              ? "bg-red-500/10 border-red-500/30 text-red-500"
                              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                        )}
                      >
                        {deploy.status}
                      </span>
                      {deploy.is_active && (
                        <span className="flex items-center gap-2 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-sm bg-[#00e5ff] text-black border border-[#00e5ff]">
                          <CheckCircle2 className="w-4 h-4" />
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-gray-500">
                      <span>{timeAgo(deploy.created_at)}</span>
                      <span className="text-[#333]">•</span>
                      <span>{deploy.files_count} FILES</span>
                      <span className="text-[#333]">•</span>
                      <span>{formatBytes(deploy.size_bytes)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  {!deploy.is_active && deploy.status === "success" && (
                    <>
                      {rollbackConfirm === deploy.id ? (
                        <div
                          className="flex items-center gap-3 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRollback(deploy.id);
                            }}
                            disabled={rollingBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-sm border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-xs font-black tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50"
                          >
                            {rollingBack ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            {rollingBack ? "ROLLING BACK..." : `DEPLOY V${deploy.version}`}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRollbackConfirm(null);
                            }}
                            className="px-4 py-2 rounded-sm bg-[#222] text-white text-xs font-black tracking-widest uppercase hover:bg-[#333] transition-all"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRollbackConfirm(deploy.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-sm text-xs font-black tracking-widest uppercase text-gray-500 hover:text-yellow-500 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all opacity-0 group-hover/item:opacity-100"
                          title={`Rollback to V${deploy.version}`}
                        >
                          <RotateCcw className="w-4 h-4" />
                          ROLLBACK
                        </button>
                      )}
                    </>
                  )}
                  {expandedDeploy === deploy.id ? (
                    <ChevronUp className="w-6 h-6 text-[#00e5ff]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </div>

              {expandedDeploy === deploy.id && (
                <div className="px-6 pb-6 pt-0 animate-slide-down border-t border-[#222]">
                  <div className="bg-[#111] p-6 mt-6 rounded-sm grid grid-cols-2 sm:grid-cols-4 gap-6 border border-[#222]">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                        <Hash className="w-4 h-4" />
                        VERSION
                      </div>
                      <p className="text-lg font-black uppercase">V{deploy.version}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                        <FileText className="w-4 h-4" />
                        FILES
                      </div>
                      <p className="text-lg font-black">{deploy.files_count}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                        <HardDrive className="w-4 h-4" />
                        SIZE
                      </div>
                      <p className="text-lg font-black">
                        {formatBytes(deploy.size_bytes)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                        <Clock className="w-4 h-4" />
                        DEPLOYED
                      </div>
                      <p className="text-lg font-black uppercase text-sm">
                        {formatDate(deploy.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#111] border border-[#222] p-6 rounded-sm">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                      <Terminal className="w-4 h-4" />
                      METHOD
                    </div>
                    <p className="text-lg font-black uppercase">CLI DEPLOY</p>
                  </div>

                  {deploy.logs && (
                    <div className="mt-4 bg-black border border-[#222] p-6 rounded-sm">
                      <p className="text-xs text-[#00e5ff] font-black uppercase tracking-widest mb-4">
                        DEPLOYMENT LOGS
                      </p>
                      <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {deploy.logs}
                      </pre>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <p className="text-[10px] text-gray-700 font-mono tracking-widest uppercase">
                      ID: {deploy.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-[#222] rounded-sm bg-[#050505]">
          <Rocket className="w-12 h-12 text-gray-600 mx-auto mb-6 opacity-50" />
          <p className="text-lg font-black uppercase tracking-widest mb-2">NO DEPLOYMENTS YET</p>
          <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">
            RUN <code className="text-[#00e5ff] font-mono mx-1">deployer deploy</code> TO INITIALIZE
          </p>
        </div>
      )}
    </div>
  );
}
