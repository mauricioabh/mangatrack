/**
 * Chapter IDs from scrape providers often contain `/`.
 * Encode as `~` for single path segments in App Router routes.
 */
export function encodeExternalId(id: string): string {
  return id.replaceAll("/", "~");
}

export function decodeExternalId(encoded: string): string {
  return decodeURIComponent(encoded).replaceAll("~", "/");
}

export function mangaPath(provider: string, mangaId: string): string {
  return `/manga/${encodeURIComponent(provider)}/${encodeURIComponent(mangaId)}`;
}

export function readerPath(provider: string, chapterId: string): string {
  return `/reader/${encodeURIComponent(provider)}/${encodeExternalId(chapterId)}`;
}

export function chapterApiPath(provider: string, chapterId: string): string {
  return `/api/chapters/${encodeURIComponent(provider)}/${encodeExternalId(chapterId)}`;
}

export function chapterPageProxyPath(
  provider: string,
  chapterId: string,
  pageIndex: number
): string {
  return `${chapterApiPath(provider, chapterId)}/pages/${pageIndex}`;
}
