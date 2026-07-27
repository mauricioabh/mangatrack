## Context

The reader client gates the entire UI on `loading` until `GET /api/chapters/[provider]/[chapterId]` returns. That handler awaits both manga info and chapter pages from Consumet. Returned `pages` are proxy paths; each image request calls `getChapterPages` again with `cache: "no-store"`, repeating the scrape before fetching the CDN image.

## Goals / Non-Goals

**Goals:**

- Share a short-TTL cache of chapter page lists across chapter JSON and page-proxy routes
- Render reader shell + page-shaped skeletons immediately (before metadata resolves)
- Keep proxy/Referer behavior for scan images; first page eager, rest lazy

**Non-Goals:**

- Prefetch from manga detail
- Cover-as-placeholder timed cascade
- Redis/Upstash or cross-region shared cache (optional later)
- Direct browser→CDN without proxy

## Decisions

### 1. In-process TTL cache for `getChapterPages`

- **Choice:** Module-level Map keyed by `provider + chapterId`, TTL ~5 minutes, store mapped `Page[]`.
- **Why:** Removes duplicate Consumet calls within the same instance during the critical first-page burst; no new infra.
- **Alternatives:** Next `unstable_cache` / `revalidate` (harder to share with imperative proxy fetch); Redis (overkill for this release).

### 2. Skeleton-first reader UI

- **Choice:** While metadata loads, show minimal chrome (back + title placeholder) and 2–3 tall shimmer page blocks. After success, keep per-image placeholders until each `<img>` fires `onLoad`.
- **Why:** Matches modern reader UX; avoids waiting on Consumet before any feedback.
- **Alternatives:** Book icon only (status quo); timed cover reveal (extra fetch, more state churn).

### 3. Preserve proxy paths

- **Choice:** Continue returning `/api/chapters/.../pages/N` URLs; cache only the upstream page list, not image bytes beyond existing `Cache-Control` on proxy responses.
- **Why:** Referer/hotlink constraints remain; caching list is the main win.

## Risks / Trade-offs

- [Serverless cold instances miss cache] → Mitigation: still correct; warm instances benefit most during page bursts
- [Stale CDN URLs within TTL] → Mitigation: short TTL (5 min); errors already return 502/retry at image layer
- [Skeletons with unknown page count] → Mitigation: show fixed 2–3 placeholders until metadata arrives, then real count

## Migration Plan

- Deploy as normal Next.js change; no DB/env migration
- Rollback: revert PR; behavior returns to book-gated load + uncached page scrapes

## Open Questions

- None blocking; Redis cache can be a follow-up if multi-instance duplication becomes measurable
