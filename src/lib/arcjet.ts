import arcjet, { shield, detectBot, fixedWindow } from "@arcjet/next";

/**
 * Standard Arcjet protection configuration
 *
 * This configuration provides standard security protection for general API endpoints
 * with the following features:
 * - Shield protection against common attacks (SQL injection, XSS, etc.)
 * - Bot detection with search engine allowlist
 * - Rate limiting of 100 requests per minute per IP
 *
 * @see https://docs.arcjet.com/reference/nextjs/
 */
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Shield against common attacks (SQL injection, XSS, etc.)
    shield({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
    }),

    // Bot detection - block automated traffic but allow search engines
    detectBot({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),

    // Rate limiting for API endpoints
    fixedWindow({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      characteristics: ["ip.src"],
      window: "1m", // 1 minute window
      max: 100, // 100 requests per minute per IP
    }),
  ],
});

/**
 * Strict Arcjet protection configuration
 *
 * This configuration provides enhanced security protection for sensitive endpoints
 * such as authentication and payment operations with stricter rate limiting:
 * - Shield protection against common attacks
 * - Bot detection with search engine allowlist
 * - Strict rate limiting of 10 requests per minute per IP
 *
 * @see https://docs.arcjet.com/reference/nextjs/
 */
export const ajStrict = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
    }),
    detectBot({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Stricter rate limiting for auth and payment endpoints
    fixedWindow({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      characteristics: ["ip.src"],
      window: "1m",
      max: 10, // 10 requests per minute for sensitive endpoints
    }),
  ],
});
