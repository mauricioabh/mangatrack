import {
  ConsumetConfigError,
  ConsumetError,
  isConsumetErrorPayload,
} from "./errors";

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_ALLOWLIST = ["mangahere", "mangapill"];
const MAX_RETRIES = 1;

export function getConsumetBaseUrl(): string {
  const base = process.env.CONSUMET_BASE_URL?.trim();
  if (!base) {
    throw new ConsumetConfigError(
      "CONSUMET_BASE_URL is not set. Configure the self-hosted Consumet origin (no fallback to public APIs)."
    );
  }
  return base.replace(/\/$/, "");
}

export function getConsumetTimeoutMs(): number {
  const raw = process.env.CONSUMET_TIMEOUT_MS;
  if (!raw) return DEFAULT_TIMEOUT_MS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 5_000) return DEFAULT_TIMEOUT_MS;
  return Math.min(n, 120_000);
}

export function getProviderAllowlist(): string[] {
  const raw = process.env.CONSUMET_PROVIDER_ALLOWLIST?.trim();
  const list = (raw ? raw.split(",") : DEFAULT_ALLOWLIST)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 ? list : DEFAULT_ALLOWLIST;
}

/** Soft preference for scripts / result ordering — does not filter search. */
export function getSoftPreferredProvider(): string | undefined {
  const p = process.env.CONSUMET_MANGA_PROVIDER?.trim().toLowerCase();
  return p || undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function consumetFetch<T>(
  path: string,
  options: {
    params?: Record<string, string | number | undefined>;
    cache?: RequestCache;
    revalidate?: number;
  } = {}
): Promise<T> {
  const base = getConsumetBaseUrl();
  const url = new URL(
    path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`
  );

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const timeoutMs = getConsumetTimeoutMs();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        ...(options.cache
          ? { cache: options.cache }
          : options.revalidate !== undefined
            ? { next: { revalidate: options.revalidate } }
            : { next: { revalidate: 300 } }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const text = await res.text();
      let body: unknown = null;
      if (text) {
        try {
          body = JSON.parse(text) as unknown;
        } catch {
          body = text;
        }
      }

      if (!res.ok) {
        const msg =
          isConsumetErrorPayload(body) && (body.message || body.error)
            ? String(body.message ?? body.error)
            : `Consumet ${res.status}: ${text.slice(0, 200)}`;
        const retryable = res.status >= 500 || res.status === 429;
        if (retryable && attempt < MAX_RETRIES) {
          await sleep(400 * (attempt + 1));
          continue;
        }
        throw new ConsumetError(msg, res.status, retryable);
      }

      if (isConsumetErrorPayload(body)) {
        throw new ConsumetError(
          String(body.message ?? body.error ?? "Consumet provider error"),
          502,
          true
        );
      }

      return body as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ConsumetError && !error.retryable) {
        throw error;
      }
      if (error instanceof ConsumetConfigError) {
        throw error;
      }
      const isTimeout =
        error instanceof Error &&
        (error.name === "TimeoutError" ||
          error.name === "AbortError" ||
          /timeout/i.test(error.message));
      if (isTimeout) {
        if (attempt < MAX_RETRIES) {
          await sleep(400 * (attempt + 1));
          continue;
        }
        throw new ConsumetError(
          `Consumet request timed out after ${timeoutMs}ms`,
          504,
          true
        );
      }
      if (
        error instanceof TypeError &&
        attempt < MAX_RETRIES
      ) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      if (error instanceof ConsumetError) {
        throw error;
      }
      throw new ConsumetError(
        error instanceof Error ? error.message : "Consumet network error",
        502,
        true
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ConsumetError("Consumet request failed", 502, true);
}
