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
  getStatusDot,
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

      // Load deployments via API
      const token = localStorage.getItem("deploynet_token");
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/deployments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    // TODO: Implement rollback API
    alert(`Rollback to deployment ${deploymentId} — API endpoint needed`);
    setRollbackConfirm(null);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Project not found</h2>
        <Link
          href="/dashboard"
          className="text-violet-400 hover:underline text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="rounded-xl glass p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={getProjectUrl(project.name)}
                  target="_blank"
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {project.name}.dsingh.fun
                </a>
                <button
                  onClick={copyUrl}
                  className="p-1 rounded hover:bg-white/5 transition-all"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Production
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-sm font-medium text-emerald-400">Active</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium">
              {formatDate(project.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Deployments</p>
            <p className="text-sm font-medium">{deployments.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Method</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-gray-400" />
              CLI
            </p>
          </div>
        </div>
      </div>

      {/* Deployments */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-violet-400" />
          Deployment History
        </h2>
      </div>

      {deployments.length > 0 ? (
        <div className="space-y-3">
          {deployments.map((deploy, index) => (
            <div
              key={deploy.id}
              className={cn(
                "rounded-xl glass transition-all",
                index === 0 && "glow-sm"
              )}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 rounded-xl transition-all"
                onClick={() =>
                  setExpandedDeploy(
                    expandedDeploy === deploy.id ? null : deploy.id
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      getStatusDot(deploy.status)
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {index === 0 ? "Current" : `v${deployments.length - index}`}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          deploy.status === "success"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : deploy.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        )}
                      >
                        {deploy.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {timeAgo(deploy.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {index > 0 && deploy.status === "success" && (
                    <>
                      {rollbackConfirm === deploy.id ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRollback(deploy.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition-all"
                          >
                            Confirm Rollback
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRollbackConfirm(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRollbackConfirm(deploy.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/5 transition-all"
                          title="Rollback to this version"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Rollback
                        </button>
                      )}
                    </>
                  )}
                  {expandedDeploy === deploy.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>

              {expandedDeploy === deploy.id && (
                <div className="px-4 pb-4 pt-0 animate-slide-down">
                  <div className="rounded-lg bg-black/30 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <FileText className="w-3 h-3" />
                        Files
                      </div>
                      <p className="text-sm font-medium">
                        {deploy.files_count}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <HardDrive className="w-3 h-3" />
                        Size
                      </div>
                      <p className="text-sm font-medium">
                        {formatBytes(deploy.size_bytes)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Clock className="w-3 h-3" />
                        Deployed
                      </div>
                      <p className="text-sm font-medium">
                        {formatDate(deploy.created_at)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Terminal className="w-3 h-3" />
                        Method
                      </div>
                      <p className="text-sm font-medium">CLI</p>
                    </div>
                  </div>

                  {deploy.logs && (
                    <div className="mt-3 rounded-lg bg-black/30 p-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        Deployment Logs
                      </p>
                      <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                        {deploy.logs}
                      </pre>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-3 font-mono">
                    ID: {deploy.id}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass rounded-xl">
          <Rocket className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No deployments yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Run <code className="text-violet-400">deployer deploy</code> to
            deploy this project
          </p>
        </div>
      )}
    </div>
  );
}
