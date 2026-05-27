const DEFAULT_BASE = "https://api.mangadex.org";

export function getMangaDexBaseUrl(): string {
  return process.env.MANGADEX_API_BASE_URL ?? DEFAULT_BASE;
}

export function getContentRatings(): string[] {
  const raw =
    process.env.MANGADEX_CONTENT_RATINGS ?? "safe,suggestive";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export class MangaDexError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "MangaDexError";
  }
}

export async function mangadexFetch<T>(
  path: string,
  params?: Record<string, string | string[] | number | undefined>
): Promise<T> {
  const base = getMangaDexBaseUrl();
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          url.searchParams.append(key, String(v));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const isAtHome = path.includes("/at-home/");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    ...(isAtHome
      ? { cache: "no-store" as const }
      : { next: { revalidate: 300 } }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new MangaDexError(
      `MangaDex ${res.status}: ${text.slice(0, 200)}`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}
