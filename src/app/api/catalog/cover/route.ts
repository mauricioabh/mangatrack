import { NextRequest, NextResponse } from "next/server";
import {
  fetchAniListCoverByTitle,
  isCloudflareBlockedCoverHost,
} from "@/lib/catalog/cover-fallback";
import { getProviderReferer } from "@/lib/consumet/referers";
import { rewriteMangaDexCoverUrl } from "@/lib/consumet/provider-routes";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const UPSTREAM_TIMEOUT_MS = 15_000;
const MAX_CONCURRENT = 4;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

let active = 0;
const waitQueue: Array<() => void> = [];

async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }
  active += 1;
  try {
    return await fn();
  } finally {
    active -= 1;
    const next = waitQueue.shift();
    if (next) next();
  }
}

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
  if (h.endsWith(".local")) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveTargetUrl(rawUrl: string, provider?: string | null): string {
  if (provider?.toLowerCase() === "mangadex") {
    return rewriteMangaDexCoverUrl(rawUrl, "256");
  }
  return rawUrl;
}

function refererCandidates(
  provider: string | null | undefined,
  explicit: string | null
): Array<string | undefined> {
  const list: Array<string | undefined> = [];
  if (explicit) list.push(explicit);
  const def = getProviderReferer(provider);
  if (def && def !== explicit) list.push(def);
  list.push(undefined);
  return list;
}

async function fetchCover(
  url: string,
  referer: string | undefined
): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": BROWSER_UA,
      ...(referer
        ? { Referer: referer, Origin: new URL(referer).origin }
        : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    redirect: "follow",
  });
}

function isUsableImageResponse(res: Response, contentType: string): boolean {
  if (!res.ok) return false;
  return (
    contentType.startsWith("image/") || contentType.includes("octet-stream")
  );
}

async function fetchAndRespond(url: string, referer?: string): Promise<NextResponse | null> {
  const upstream = await fetchCover(url, referer);
  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  if (!isUsableImageResponse(upstream, contentType)) return null;
  const body = await upstream.arrayBuffer();
  if (body.byteLength === 0) return null;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

async function tryAniListFallback(title: string | null): Promise<NextResponse | null> {
  if (!title?.trim()) return null;
  const fallbackUrl = await fetchAniListCoverByTitle(title);
  if (!fallbackUrl) return null;
  try {
    const parsed = new URL(fallbackUrl);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol) || isPrivateHost(parsed.hostname)) {
      return null;
    }
  } catch {
    return null;
  }
  return fetchAndRespond(fallbackUrl);
}

/**
 * Proxy catalog cover images so scrape CDNs receive the Referer they require.
 * GET /api/catalog/cover?url=...&referer=...&provider=mangahere&title=One%20Piece
 *
 * For ComicK (Cloudflare-blocked CDN), pass `title` to enable AniList cover fallback.
 */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const provider = request.nextUrl.searchParams.get("provider")?.toLowerCase();
  const explicitReferer = request.nextUrl.searchParams.get("referer");
  const title = request.nextUrl.searchParams.get("title");

  if (!rawUrl) {
    return NextResponse.json(
      { success: false, error: "url is required" },
      { status: 400 }
    );
  }

  let target: URL;
  try {
    target = new URL(resolveTargetUrl(rawUrl, provider));
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid url" },
      { status: 400 }
    );
  }

  if (!ALLOWED_PROTOCOLS.has(target.protocol) || isPrivateHost(target.hostname)) {
    return NextResponse.json(
      { success: false, error: "URL not allowed" },
      { status: 400 }
    );
  }

  // Optional AniList title fallback when CDN is known-blocked (kept for future scrapers)
  const preferFallback =
    Boolean(title?.trim()) &&
    isCloudflareBlockedCoverHost(target.hostname);

  try {
    if (preferFallback) {
      const fallback = await withConcurrencyLimit(() => tryAniListFallback(title));
      if (fallback) return fallback;
    }

    const result = await withConcurrencyLimit(async () => {
      const candidates = refererCandidates(provider, explicitReferer);
      let last: Response | null = null;
      for (const referer of candidates) {
        let upstream = await fetchCover(target.toString(), referer);
        const ct = upstream.headers.get("content-type") ?? "";
        if (isUsableImageResponse(upstream, ct)) {
          return upstream;
        }

        if (target.protocol === "http:") {
          await sleep(150);
          const httpsUrl = target.toString().replace(/^http:/, "https:");
          upstream = await fetchCover(httpsUrl, referer);
          const ct2 = upstream.headers.get("content-type") ?? "";
          if (isUsableImageResponse(upstream, ct2)) {
            return upstream;
          }
        }

        last = upstream;
        if (upstream.status === 403 || ct.includes("text/html")) {
          await sleep(100);
          continue;
        }
        break;
      }
      return last!;
    });

    const contentType = result.headers.get("content-type") ?? "image/jpeg";
    if (isUsableImageResponse(result, contentType)) {
      const body = await result.arrayBuffer();
      if (body.byteLength > 0) {
        return new NextResponse(body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    }

    // CDN failed — last chance AniList by title
    const fallback = await tryAniListFallback(title);
    if (fallback) return fallback;

    return new NextResponse(null, {
      status:
        result.status === 404 || result.status === 403 ? result.status : 502,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Cover proxy error:", error);
    try {
      const fallback = await tryAniListFallback(title);
      if (fallback) return fallback;
    } catch {
      // ignore
    }
    return new NextResponse(null, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
