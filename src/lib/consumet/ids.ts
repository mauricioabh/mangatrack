/**
 * Manga / chapter IDs from scrape providers often contain `/`
 * (e.g. mangapill `3069/naruto`, chapter `3069-…/naruto-chapter-1`).
 * Encode as `~` for single App Router path segments — `%2F` is unreliable
 * (proxies / Next may split the path).
 */
export function encodeExternalId(id: string): string {
  return id.replaceAll("/", "~");
}

export function decodeExternalId(encoded: string): string {
  return decodeURIComponent(encoded).replaceAll("~", "/");
}

export function mangaPath(provider: string, mangaId: string): string {
  return `/manga/${encodeURIComponent(provider)}/${encodeExternalId(mangaId)}`;
}

export function mangaApiPath(provider: string, mangaId: string): string {
  return `/api/manga/${encodeURIComponent(provider)}/${encodeExternalId(mangaId)}`;
}

export function readerPath(
  provider: string,
  chapterId: string,
  mangaId?: string
): string {
  const base = `/reader/${encodeURIComponent(provider)}/${encodeExternalId(chapterId)}`;
  if (!mangaId) return base;
  return `${base}?mangaId=${encodeURIComponent(mangaId)}`;
}

export function chapterApiPath(
  provider: string,
  chapterId: string,
  mangaId?: string
): string {
  const base = `/api/chapters/${encodeURIComponent(provider)}/${encodeExternalId(chapterId)}`;
  if (!mangaId) return base;
  return `${base}?mangaId=${encodeURIComponent(mangaId)}`;
}

export function chapterPageProxyPath(
  provider: string,
  chapterId: string,
  pageIndex: number
): string {
  return `${chapterApiPath(provider, chapterId)}/pages/${pageIndex}`;
}
