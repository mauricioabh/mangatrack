import type {
  AppMangaStatus,
  Chapter,
  ConsumetChapterRaw,
  ConsumetInfoResponse,
  ConsumetPageRaw,
  ConsumetSearchResult,
  MangaDetail,
  MangaSummary,
  Page,
} from "./types";
import { normalizeCoverUrl } from "./provider-routes";
import { getProviderReferer } from "./referers";

export function mapStatus(raw?: string | null): AppMangaStatus {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("complete")) return "COMPLETED";
  if (s.includes("hiatus")) return "HIATUS";
  if (s.includes("cancel")) return "CANCELLED";
  if (s.includes("ongoing") || s.includes("publishing")) return "ONGOING";
  return "ONGOING";
}

function firstAltTitle(
  altTitles?: string[] | Array<Record<string, string>>
): string | undefined {
  if (!altTitles || altTitles.length === 0) return undefined;
  for (const entry of altTitles) {
    if (typeof entry === "string" && entry.trim()) return entry.trim();
    if (entry && typeof entry === "object") {
      const localized = resolveLocalizedString(entry);
      if (localized) return localized;
    }
  }
  return undefined;
}

/**
 * MangaDex (and some Consumet payloads) return localized maps like
 * `{ en: "...", ja: "..." }` instead of plain strings.
 */
export function resolveLocalizedString(
  value: unknown,
  preferredLocales: string[] = ["en", "en-us", "ja-ro", "ja"]
): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const map = value as Record<string, unknown>;
  for (const locale of preferredLocales) {
    const hit = map[locale];
    if (typeof hit === "string" && hit.trim()) return hit.trim();
  }
  // Case-insensitive locale match
  const entries = Object.entries(map);
  for (const locale of preferredLocales) {
    const found = entries.find(
      ([key, v]) =>
        key.toLowerCase() === locale.toLowerCase() &&
        typeof v === "string" &&
        v.trim()
    );
    if (found && typeof found[1] === "string") return found[1].trim();
  }
  for (const v of Object.values(map)) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function resolveTitle(
  title: unknown,
  altTitles?: string[] | Array<Record<string, string>>,
  fallbackTitle?: string
): string {
  const fromTitle = resolveLocalizedString(title);
  if (fromTitle) return fromTitle;
  const alt = firstAltTitle(altTitles);
  if (alt) return alt;
  if (fallbackTitle?.trim()) return fallbackTitle.trim();
  return "Untitled";
}

/** Prefer non-empty image; mangapill info often omits cover — synthesize from id. */
export function resolveCoverImage(
  provider: string,
  id: string,
  image?: string | null
): string | undefined {
  if (typeof image === "string" && image.trim()) {
    return normalizeCoverUrl(provider, image.trim());
  }
  if (provider === "mangapill") {
    const numeric = id.split("/")[0];
    if (/^\d+$/.test(numeric)) {
      return `https://cdn.readdetectiveconan.com/file/mangapill/i/${numeric}.jpg`;
    }
  }
  return undefined;
}

export function mapSearchResult(
  item: ConsumetSearchResult,
  provider: string
): MangaSummary {
  return {
    id: item.id,
    provider,
    title: resolveTitle(item.title, item.altTitles),
    description: resolveLocalizedString(item.description),
    coverImage: resolveCoverImage(provider, item.id, item.image),
    coverReferer:
      item.headerForImage?.Referer ??
      item.headerForImage?.referer ??
      getProviderReferer(provider),
    status: mapStatus(item.status),
    genres: [],
    author: undefined,
  };
}

function parseChapterNumberFromTitle(title: string): number {
  const chMatch = title.match(/ch\.?\s*(\d+(?:\.\d+)?)/i);
  if (chMatch) return Number.parseFloat(chMatch[1]);
  const numMatch = title.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) return Number.parseFloat(numMatch[1]);
  return 0;
}

export function mapChapter(
  raw: ConsumetChapterRaw,
  mangaId: string
): Chapter {
  let chapterNumber = 0;
  if (raw.chapterNumber != null && String(raw.chapterNumber).length > 0) {
    const n = Number.parseFloat(String(raw.chapterNumber));
    if (!Number.isNaN(n)) chapterNumber = n;
  } else if (raw.title) {
    chapterNumber = parseChapterNumberFromTitle(raw.title);
  }

  const title =
    (typeof raw.title === "string" && raw.title.trim()) ||
    (chapterNumber > 0 ? `Chapter ${chapterNumber}` : "Chapter");

  return {
    id: raw.id,
    mangaId,
    title,
    chapterNumber,
    pages: 0,
    publishedAt: raw.releasedDate ?? undefined,
  };
}

/** Newest chapter by `publishedAt`, else scraper newest-first (`chapters[0]`). */
export function getLatestChapterUpdate(chapters: Chapter[]): {
  chapterId?: string;
  chapterNumber: number;
  publishedAt?: string;
  publishedAtMs: number | null;
} {
  if (chapters.length === 0) {
    return { chapterNumber: 0, publishedAtMs: null };
  }

  let best: Chapter | null = null;
  let bestMs = -1;

  for (const chapter of chapters) {
    if (!chapter.publishedAt) continue;
    const ms = Date.parse(chapter.publishedAt);
    if (Number.isNaN(ms)) continue;
    if (ms > bestMs) {
      bestMs = ms;
      best = chapter;
    }
  }

  const newest = best ?? chapters[0];
  return {
    chapterId: newest.id,
    chapterNumber: newest.chapterNumber,
    publishedAt: newest.publishedAt,
    publishedAtMs: best ? bestMs : null,
  };
}

export function mapMangaDetail(
  info: ConsumetInfoResponse,
  provider: string,
  fallbackTitle?: string
): MangaDetail {
  const authors = info.authors ?? [];
  const artistRaw = info.artist;
  const artist = Array.isArray(artistRaw)
    ? artistRaw[0]
    : typeof artistRaw === "string"
      ? artistRaw
      : undefined;

  const chapters = (info.chapters ?? []).map((c) => mapChapter(c, info.id));

  return {
    id: info.id,
    provider,
    title: resolveTitle(info.title, info.altTitles, fallbackTitle),
    description: resolveLocalizedString(info.description),
    coverImage: resolveCoverImage(provider, info.id, info.image),
    coverReferer:
      info.headers?.Referer ??
      info.headers?.referer ??
      getProviderReferer(provider),
    status: mapStatus(info.status),
    genres: info.genres ?? [],
    author: authors[0],
    artist,
    chapters,
  };
}

/**
 * Map Consumet pages and normalize to 0-based indices for proxy paths.
 * MangaPill uses 1-based `page`; MangaHere uses 0-based — proxy always uses 0..n-1.
 */
export function mapPages(raw: ConsumetPageRaw[]): Page[] {
  const pages: Page[] = [];
  for (let i = 0; i < raw.length; i++) {
    const p = raw[i];
    const url = p.img;
    if (!url) continue;
    const sortKey = typeof p.page === "number" ? p.page : i;
    pages.push({
      index: sortKey,
      url,
      referer: p.headerForImage?.Referer ?? p.headerForImage?.referer,
    });
  }
  return pages
    .sort((a, b) => a.index - b.index)
    .map((p, i) => ({ ...p, index: i }));
}

export function getChapterNeighbors<T extends { id: string }>(
  chapters: T[],
  currentId: string
): { previous: T | null; next: T | null } {
  const index = chapters.findIndex((c) => c.id === currentId);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index < chapters.length - 1 ? chapters[index + 1] : null,
    next: index > 0 ? chapters[index - 1] : null,
  };
}

export function buildChapterPageProxyPaths(
  provider: string,
  chapterId: string,
  pageCount: number
): string[] {
  const enc = chapterId.replaceAll("/", "~");
  return Array.from(
    { length: pageCount },
    (_, index) =>
      `/api/chapters/${encodeURIComponent(provider)}/${enc}/pages/${index}`
  );
}
