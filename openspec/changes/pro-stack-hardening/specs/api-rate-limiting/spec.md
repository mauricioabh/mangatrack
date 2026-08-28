## Purpose

Protect expensive and abuse-prone API routes with optional Upstash rate limiting while preserving normal operation when Upstash credentials are absent.

## ADDED Requirements

### Requirement: Graceful degradation without Upstash

When `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` is missing, rate-limited routes MUST behave as today (no 429 solely due to missing Upstash config).

#### Scenario: Local dev without Upstash

- **WHEN** a signed-in user calls a rate-limited route and Upstash is not configured
- **THEN** the request proceeds without rate-limit rejection

### Requirement: Rate limit sensitive catalog and account routes

The system MUST apply per-user sliding-window rate limits (via Upstash when configured) to: manga search, chapter count, browse feed, catalog cover proxy, Stripe checkout creation, and account deletion.

#### Scenario: Search rate limit exceeded

- **WHEN** a signed-in user exceeds the search limit within the window
- **THEN** `GET /api/manga/search` responds with HTTP 429
- **AND** includes a `Retry-After` header in seconds

#### Scenario: Under limit passes

- **WHEN** a signed-in user is under the configured limit
- **THEN** the route processes normally

### Requirement: Reader and webhooks excluded

Rate limiting MUST NOT apply to chapter page image proxy routes, Clerk/Stripe/Inngest webhooks, or any Redis-backed response caching.

#### Scenario: Reader page load

- **WHEN** a user loads multiple chapter page images in the reader
- **THEN** page proxy routes are not rejected by Upstash rate limits
