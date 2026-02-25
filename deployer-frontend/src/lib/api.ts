// API client for DeployNet backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://deployer-be.dsingh.fun";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("deploynet_token");
}

export function setToken(token: string) {
  localStorage.setItem("deploynet_token", token);
}

export function clearToken() {
  localStorage.removeItem("deploynet_token");
  localStorage.removeItem("deploynet_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("deploynet_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem("deploynet_user", JSON.stringify(user));
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  provider: string;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  repo_url?: string;
  created_at: string;
  url?: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  version: number;
  status: string;
  source: string;
  commit_hash?: string;
  commit_message?: string;
  files_count: number;
  size_bytes: number;
  logs?: string;
  is_active: boolean;
  created_at: string;
}

export interface ExploreProject {
  id: string;
  name: string;
  username: string;
  deployment_count: number;
  last_deployed: string;
  url: string;
}

// Auth
export async function handleOAuthCallback(
  provider: string,
  code: string
): Promise<{ token: string; email: string }> {
  // Pass source=web and redirect_uri so the backend uses the correct OAuth credentials
  const redirectUri = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({
    code,
    source: "web",
    redirect_uri: redirectUri,
  });
  return apiFetch(`/api/auth/${provider}/callback?${params.toString()}`);
}

// Projects
export async function listProjects(): Promise<Project[]> {
  return apiFetch("/api/projects");
}

export async function getProject(id: string): Promise<Project> {
  return apiFetch(`/api/projects/${id}`);
}

export async function createProject(name: string): Promise<Project> {
  return apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return apiFetch(`/api/projects/${id}`, { method: "DELETE" });
}

// Deployments
export async function getDeploymentStatus(id: string): Promise<Deployment> {
  return apiFetch(`/api/deployments/${id}`);
}

export async function getDeploymentLogs(
  id: string
): Promise<{ logs: string }> {
  return apiFetch(`/api/deployments/${id}/logs`);
}

// Buckets
export async function checkBucketAvailability(
  name: string
): Promise<{ available: boolean }> {
  return apiFetch("/api/buckets/check", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// Explore (public)
export async function getExploreProjects(): Promise<ExploreProject[]> {
  return apiFetch("/api/explore");
}

// Health
export async function healthCheck(): Promise<string> {
  const res = await fetch(`${API_BASE}/health`);
  return res.text();
}

export { API_BASE };
