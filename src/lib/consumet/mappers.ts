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
      for (const value of Object.values(entry)) {
        if (typeof value === "string" && value.trim()) return value.trim();
      }
    }
  }
  return undefined;
}

export function resolveTitle(
  title: string | null | undefined,
  altTitles?: string[] | Array<Record<string, string>>,
  fallbackTitle?: string
): string {
  if (typeof title === "string" && title.trim()) return title.trim();
  const alt = firstAltTitle(altTitles);
  if (alt) return alt;
  if (fallbackTitle?.trim()) return fallbackTitle.trim();
  return "Untitled";
}

export function mapSearchResult(
  item: ConsumetSearchResult,
  provider: string
): MangaSummary {
  return {
    id: item.id,
    provider,
    title: resolveTitle(item.title, item.altTitles),
    description: item.description ?? undefined,
    coverImage: item.image ?? undefined,
    coverReferer:
      item.headerForImage?.Referer ?? item.headerForImage?.referer,
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
    description: info.description ?? undefined,
    coverImage: info.image ?? undefined,
    coverReferer: info.headers?.Referer ?? info.headers?.referer,
    status: mapStatus(info.status),
    genres: info.genres ?? [],
    author: authors[0],
    artist,
    chapters,
  };
}

export function mapPages(raw: ConsumetPageRaw[]): Page[] {
  const pages: Page[] = [];
  for (let i = 0; i < raw.length; i++) {
    const p = raw[i];
    const url = p.img;
    if (!url) continue;
    const index = typeof p.page === "number" ? p.page : i;
    pages.push({
      index,
      url,
      referer: p.headerForImage?.Referer ?? p.headerForImage?.referer,
    });
  }
  return pages.sort((a, b) => a.index - b.index);
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
