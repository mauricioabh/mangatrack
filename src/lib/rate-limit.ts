import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

export type RateLimitResult =
  { limited: false } | { limited: true; retryAfterSec: number };

type LimiterKey =
  "search" | "chapterCount" | "browse" | "cover" | "checkout" | "deleteAccount";

const limiterCache = new Map<LimiterKey, Ratelimit | null>();

function getLimiter(key: LimiterKey): Ratelimit | null {
  const cached = limiterCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    limiterCache.set(key, null);
    return null;
  }

  const redis = new Redis({ url, token });
  const configs: Record<
    LimiterKey,
    { limit: number; window: `${number} m` | `${number} h` }
  > = {
    search: { limit: 20, window: "1 m" },
    chapterCount: { limit: 60, window: "1 m" },
    browse: { limit: 30, window: "1 m" },
    cover: { limit: 120, window: "1 m" },
    checkout: { limit: 5, window: "1 m" },
    deleteAccount: { limit: 3, window: "1 h" },
  };

  const config = configs[key];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `mangatrack:${key}`,
  });

  limiterCache.set(key, limiter);
  return limiter;
}

async function rateLimitByKey(
  key: LimiterKey,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(key);
  if (!limiter) {
    return { limited: false };
  }

  const { success, reset } = await limiter.limit(identifier);
  if (success) {
    return { limited: false };
  }

  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { limited: true, retryAfterSec };
}

export function isUpstashConfigured(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export function rateLimitSearch(userId: string) {
  return rateLimitByKey("search", userId);
}

export function rateLimitChapterCount(userId: string) {
  return rateLimitByKey("chapterCount", userId);
}

export function rateLimitBrowse(userId: string) {
  return rateLimitByKey("browse", userId);
}

export function rateLimitCover(userId: string) {
  return rateLimitByKey("cover", userId);
}

export function rateLimitCheckout(userId: string) {
  return rateLimitByKey("checkout", userId);
}

export function rateLimitDeleteAccount(userId: string) {
  return rateLimitByKey("deleteAccount", userId);
}

export function rateLimitResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({ success: false, error: "Too many requests" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
