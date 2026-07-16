import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const UPSTREAM_TIMEOUT_MS = 12_000;
const MAX_CONCURRENT = 4;

/** Default Referer headers scrapers expect for cover hotlink CDNs */
const PROVIDER_REFERERS: Record<string, string> = {
  mangahere: "https://mangahere.cc/",
  mangapill: "https://mangapill.com/",
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

async function fetchCover(
  url: string,
  referer: string | undefined
): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": BROWSER_UA,
      ...(referer ? { Referer: referer } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
}

/**
 * Proxy catalog cover images so scrape CDNs receive the Referer they require.
 * GET /api/catalog/cover?url=...&referer=...&provider=mangahere
 */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const provider = request.nextUrl.searchParams.get("provider")?.toLowerCase();
  const explicitReferer = request.nextUrl.searchParams.get("referer");

  if (!rawUrl) {
    return NextResponse.json(
      { success: false, error: "url is required" },
      { status: 400 }
    );
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
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

  const referer =
    explicitReferer ||
    (provider ? PROVIDER_REFERERS[provider] : undefined) ||
    undefined;

  try {
    const result = await withConcurrencyLimit(async () => {
      let upstream = await fetchCover(target.toString(), referer);

      // One retry after brief backoff (CDN rate limits under search stampede)
      if (!upstream.ok || upstream.status === 403) {
        await sleep(250);
        const httpsUrl =
          target.protocol === "http:"
            ? target.toString().replace(/^http:/, "https:")
            : target.toString();
        upstream = await fetchCover(httpsUrl, referer);
      }

      return upstream;
    });

    if (!result.ok) {
      return new NextResponse(null, {
        status: result.status === 404 || result.status === 403 ? result.status : 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const contentType = result.headers.get("content-type") ?? "image/jpeg";
    if (
      !contentType.startsWith("image/") &&
      !contentType.includes("octet-stream")
    ) {
      return new NextResponse(null, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const body = await result.arrayBuffer();
    if (body.byteLength === 0) {
      return new NextResponse(null, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Cover proxy error:", error);
    return new NextResponse(null, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
