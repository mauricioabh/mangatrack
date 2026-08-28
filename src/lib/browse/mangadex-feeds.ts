/**
 * Browse feed client - MangaDex public API (metadata only).
 *
 * EXCEPTION to "catalog via Consumet": Consumet has no real recent/trending
 * feeds (provider /recent is a text search). Discovery listados use
 * https://api.mangadex.org; opening a title continues via Consumet
 * (manga/mangadex/{uuid} or search). See docs/MANGA_SOURCE.md.
 */

export type BrowseMode = "new" | "latest" | "trending";
export type BrowsePeriod = "today" | "week" | "month";

export type BrowseCard = {
  id: string;
  title: string;
  coverImage: string | null;
  /** In-app href: mangadex detail when UUID, else search-by-title */
  href: string;
};

const MANGADEX_API = "https://api.mangadex.org";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_LIMIT = 24;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isMangaDexUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

export function browseCardHref(id: string, title: string): string {
  if (isMangaDexUuid(id)) {
    return "/manga/mangadex/" + encodeURIComponent(id);
  }
  return "/search?q=" + encodeURIComponent(title);
}

export function periodSinceIso(
  period: BrowsePeriod,
  now: Date = new Date(),
): string {
  const d = new Date(now.getTime());
  switch (period) {
    case "today":
      d.setUTCHours(d.getUTCHours() - 24);
      break;
    case "week":
      d.setUTCDate(d.getUTCDate() - 7);
      break;
    case "month":
      d.setUTCDate(d.getUTCDate() - 30);
      break;
    default: {
      const _exhaustive: never = period;
      return _exhaustive;
    }
  }
  return d.toISOString().replace(/\.\d{3}Z$/, "");
}

type MdTitle = Record<string, string> | undefined;

function pickTitle(title: MdTitle, altTitles?: MdTitle[]): string {
  if (title?.en) return title.en;
  if (title) {
    const first = Object.values(title).find((v) => v?.trim());
    if (first) return first;
  }
  if (altTitles) {
    for (const alt of altTitles) {
      if (alt?.en) return alt.en;
      const first = Object.values(alt ?? {}).find((v) => v?.trim());
      if (first) return first;
    }
  }
  return "Untitled";
}

function coverUrl(
  mangaId: string,
  relationships: Array<{
    type?: string;
    attributes?: { fileName?: string };
  }>,
): string | null {
  const cover = relationships.find((r) => r.type === "cover_art");
  const fileName = cover?.attributes?.fileName;
  if (!fileName) return null;
  return (
    "https://uploads.mangadex.org/covers/" +
    mangaId +
    "/" +
    fileName +
    ".256.jpg"
  );
}

type MdMangaListResponse = {
  data?: Array<{
    id?: string;
    attributes?: {
      title?: MdTitle;
      altTitles?: MdTitle[];
    };
    relationships?: Array<{
      type?: string;
      attributes?: { fileName?: string };
    }>;
  }>;
};

function buildOrderParams(mode: BrowseMode): Record<string, string> {
  switch (mode) {
    case "new":
      return { "order[createdAt]": "desc" };
    case "latest":
      return { "order[latestUploadedChapter]": "desc" };
    case "trending":
      // followedCount is global popularity; period window filters updatedAt
      return { "order[followedCount]": "desc" };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function buildTimeFilter(
  mode: BrowseMode,
  period: BrowsePeriod,
): Record<string, string> {
  const since = periodSinceIso(period);
  switch (mode) {
    case "new":
      return { createdAtSince: since };
    case "latest":
    case "trending":
      // MD has no followedCount window; approximate with updatedAtSince
      return { updatedAtSince: since };
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export async function fetchBrowseFeed(options: {
  mode: BrowseMode;
  period: BrowsePeriod;
  limit?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<BrowseCard[]> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", "0");
  params.append("includes[]", "cover_art");
  for (const [key, value] of Object.entries(buildOrderParams(options.mode))) {
    params.set(key, value);
  }
  for (const [key, value] of Object.entries(
    buildTimeFilter(options.mode, options.period),
  )) {
    params.set(key, value);
  }
  // Browse discovery: safe only (no suggestive/erotica/pornographic)
  params.append("contentRating[]", "safe");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(MANGADEX_API + "/manga?" + params.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MangaTrack/1.0 (browse feeds; +https://wayool.com)",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("MangaDex browse feed failed: " + res.status);
    }

    const json = (await res.json()) as MdMangaListResponse;
    const rows = json.data ?? [];

    return rows
      .map((row) => {
        const id = row.id?.trim();
        if (!id) return null;
        const title = pickTitle(
          row.attributes?.title,
          row.attributes?.altTitles,
        );
        const card: BrowseCard = {
          id,
          title,
          coverImage: coverUrl(id, row.relationships ?? []),
          href: browseCardHref(id, title),
        };
        return card;
      })
      .filter((c): c is BrowseCard => c != null);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}
