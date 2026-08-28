/**
 * Cover fallback when provider CDNs are blocked (e.g. ComicK Cloudflare).
 * Uses AniList public GraphQL — no API key.
 */

const ANILIST_URL = "https://graphql.anilist.co";
const TIMEOUT_MS = 10_000;

type AniListMedia = {
  coverImage?: { large?: string | null; medium?: string | null } | null;
  title?: { english?: string | null; romaji?: string | null } | null;
};

const cache = new Map<string, { url: string | null; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function cacheKey(title: string): string {
  return title.trim().toLowerCase();
}

export async function fetchAniListCoverByTitle(
  title: string,
): Promise<string | undefined> {
  const key = cacheKey(title);
  if (!key) return undefined;

  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.url ?? undefined;
  }

  const query = `
    query ($search: String) {
      Media(search: $search, type: MANGA) {
        coverImage { large medium }
        title { english romaji }
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { search: title.trim() },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      cache.set(key, { url: null, expires: Date.now() + 5 * 60_000 });
      return undefined;
    }

    const json = (await res.json()) as {
      data?: { Media?: AniListMedia | null };
    };
    const media = json.data?.Media;
    const url =
      media?.coverImage?.large?.trim() ||
      media?.coverImage?.medium?.trim() ||
      undefined;

    cache.set(key, {
      url: url ?? null,
      expires: Date.now() + CACHE_TTL_MS,
    });
    return url;
  } catch {
    cache.set(key, { url: null, expires: Date.now() + 5 * 60_000 });
    return undefined;
  }
}

/** Hosts that frequently return Cloudflare 403 to Node fetch */
export function isCloudflareBlockedCoverHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h.endsWith("comicknew.pictures") ||
    h.endsWith("comick.pictures") ||
    h === "meo.comick.pictures"
  );
}
