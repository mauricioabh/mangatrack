/**
 * Consumet provider routing quirks.
 *
 * MangaDex on Consumet expects path-style info/read:
 *   /manga/mangadex/info/{id}
 *   /manga/mangadex/read/{chapterId}
 * Query-style `?id=` / `?chapterId=` is mis-routed to search for this provider.
 *
 * Scrapers (mangahere, mangapill) use query-style:
 *   /manga/{provider}/info?id=
 *   /manga/{provider}/read?chapterId=
 */

const PATH_STYLE_INFO_PROVIDERS = new Set(["mangadex"]);
const PATH_STYLE_READ_PROVIDERS = new Set(["mangadex"]);

export function usesPathStyleInfo(provider: string): boolean {
  return PATH_STYLE_INFO_PROVIDERS.has(provider.toLowerCase());
}

export function usesPathStyleRead(provider: string): boolean {
  return PATH_STYLE_READ_PROVIDERS.has(provider.toLowerCase());
}

export function consumetInfoPath(provider: string, id: string): string {
  const p = provider.toLowerCase();
  if (usesPathStyleInfo(p)) {
    return `/manga/${p}/info/${encodeURIComponent(id)}`;
  }
  return `/manga/${p}/info`;
}

export function consumetReadPath(provider: string, chapterId: string): string {
  const p = provider.toLowerCase();
  if (usesPathStyleRead(p)) {
    return `/manga/${p}/read/${encodeURIComponent(chapterId)}`;
  }
  return `/manga/${p}/read`;
}

/**
 * MangaDex search/info often returns mangadex.org/covers/... which is slow/flaky.
 * Prefer uploads.mangadex.org with a small derivative for catalog tiles.
 */
export function rewriteMangaDexCoverUrl(
  url: string,
  size: "256" | "512" | null = "256"
): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== "mangadex.org" && host !== "uploads.mangadex.org") {
      return url;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] !== "covers" || parts.length < 3) return url;
    const mangaId = parts[1];
    let file = parts.slice(2).join("/");
    file = file.replace(/\.(256|512)\.jpe?g$/i, "");
    const sized = size ? `${file}.${size}.jpg` : file;
    return `https://uploads.mangadex.org/covers/${mangaId}/${sized}`;
  } catch {
    return url;
  }
}

/** Normalize cover URL for catalog display (provider-aware CDN rewrites). */
export function normalizeCoverUrl(
  provider: string,
  url: string | null | undefined
): string | undefined {
  if (typeof url !== "string" || !url.trim()) return undefined;
  const trimmed = url.trim();
  if (provider.toLowerCase() === "mangadex") {
    return rewriteMangaDexCoverUrl(trimmed, "256");
  }
  return trimmed;
}
