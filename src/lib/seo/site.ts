import { env } from "@/env";

export const SITE_NAME = "MangaTrack";

export const DEFAULT_DESCRIPTION =
  "A clean, minimalist web app for discovering, reading, and tracking manga with automated updates.";

export function getSiteUrl(): string {
  const configured =
    env.NEXT_PUBLIC_SITE_URL?.trim() || env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercel = env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

const PRODUCTION_GIT_BRANCHES = new Set(["main", "master"]);

export function isPreviewDeployment(): boolean {
  if (env.VERCEL_ENV === "preview") return true;

  const branch = env.VERCEL_GIT_COMMIT_REF?.trim();
  if (branch && !PRODUCTION_GIT_BRANCHES.has(branch)) return true;

  return false;
}

/** Block indexing on preview deployments unless explicitly overridden. */
export function allowSearchIndexing(): boolean {
  if (env.OMNI_ALLOW_PREVIEW_INDEX) return true;
  return !isPreviewDeployment();
}
