import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return past.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      past.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDeployDomain(): string {
  return process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || "dsingh.fun";
}

export function getProjectUrl(projectName: string): string {
  return `https://${projectName}.${getDeployDomain()}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "success":
      return "text-emerald-400";
    case "failed":
      return "text-red-400";
    case "uploading":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case "success":
      return "bg-emerald-400";
    case "failed":
      return "bg-red-400";
    case "uploading":
      return "bg-yellow-400";
    default:
      return "bg-gray-400";
  }
}
