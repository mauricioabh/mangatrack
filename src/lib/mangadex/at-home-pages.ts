import { mangadexFetch } from "./client";
import { mapAtHomeToPages } from "./mappers";
import type { MangaDexAtHomeResponse } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000;

const pageUrlCache = new Map<
  string,
  { urls: string[]; expiresAt: number }
>();

/** Fresh @home page URLs for a chapter (short-lived CDN links). */
export async function getChapterPageUrls(chapterId: string): Promise<string[]> {
  const cached = pageUrlCache.get(chapterId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.urls;
  }

  const atHome = await mangadexFetch<MangaDexAtHomeResponse>(
    `/at-home/server/${chapterId}`
  );
  const urls = mapAtHomeToPages(atHome, true);

  pageUrlCache.set(chapterId, {
    urls,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return urls;
}

export function buildChapterPageProxyPaths(
  chapterId: string,
  pageCount: number
): string[] {
  return Array.from(
    { length: pageCount },
    (_, index) => `/api/chapters/${chapterId}/pages/${index}`
  );
}
