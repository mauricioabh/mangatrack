## Context

MangaTrack currently catalogs manga via a direct MangaDex BFF (`src/lib/mangadex/`), stores UUID-only `mangaDexId` / `chapterDexId` in Neon, and can receive near-real-time new-chapter events through `/api/webhook/mangadex` → Inngest.

Wayool already self-hosts Consumet at `https://consumet.wayool.com` (Cloudflare → nginx → Docker on `127.0.0.1:3000`, Redis cache ~1h). Live checks show MangaDex listings for titles under takedown (e.g. One Piece) return almost no chapters, while MangaHere / MangaPill return 1200+ — so multiprovider selection is a product requirement, not optional polish.

This change switches MangaTrack’s catalog to Consumet only, keys user library state by `(provider, externalId)`, wipes legacy rows, and replaces the webhook with a daily poll.

## Goals / Non-Goals

**Goals:**

- Server-only Consumet client + BFF for search / info / read.
- Search UX that surfaces multiple providers; user picks which listing to use.
- Prisma/Neon provider-scoped favorites, history, notifications; wipe old data.
- Daily cron polling favorites for new chapters; remove MangaDex webhook dependency.
- Document env and retire direct MangaDex API as catalog source.

**Non-Goals:**

- Changing Consumet VPS/infra.
- Cross-provider canonical manga graph (Anilist mapping) in v1.
- Hard product “default provider” that hides others in search (optional env fallback only for single-provider tools/scripts).

## Decisions

### D1 — Consumet replaces MangaDex API in-app

- **Choice:** All catalog traffic goes to `CONSUMET_BASE_URL`. Delete or stop calling `api.mangadex.org` from MangaTrack.
- **Why:** One integration surface; multiprovider already behind Consumet; avoids dual clients and dual ID spaces.
- **Alternatives:** Keep MangaDex for metadata + Consumet for read — rejected (two sources, webhook confusion, incomplete EN chapters still on MD).

### D2 — Identity: `provider` + external IDs (option B)

- **Choice:** Columns like `provider`, `externalMangaId`, `externalChapterId` (rename off `*DexId`). Uniques: `(userId, provider, externalMangaId)`, `(userId, provider, externalChapterId)`.
- **Why:** Clear queries/indexes; avoids ambiguous composite string parsing.
- **Alternatives:** Single composite string `mangahere:one_piece` — possible later as derived display key, not primary storage.

### D3 — No hard UX default provider

- **Choice:** Search runs against an allowlist of providers (parallel or sequential with timeouts). Results always include `provider`. User chooses the listing. Env `CONSUMET_MANGA_PROVIDER` is optional for scripts / single-provider debug only, not for hiding others in UI.
- **Why:** Completeness varies by title; user preference is the product rule.
- **Alternatives:** Default MangaHere — useful as soft “prefer this in sort”, not as sole source.

### D4 — Wipe Neon manga-linked rows

- **Choice:** Truncate/delete `user_favorites`, mangarelated `reading_history`, and notification rows that reference manga IDs before/at schema migrate; no UUID backfill.
- **Why:** Near-empty prod data; cleaner than fake `provider='mangadex'` assumptions.
- **Alternatives:** Soft-migrate MD UUID → `provider=mangadex` — only if product insists on keeping favorites (not requested).

### D5 — Domain normalization

- Map Consumet payloads → `MangaSummary`, `MangaDetail`, `Chapter`, `Page` in `src/lib/consumet/` (or `catalog/`).
- Fallbacks: missing `title` → first `altTitles` / cached search title; Consumet `{ message, error }` → typed error + UI retry.
- Timeouts 30–60s; light retries on 5xx/network only.

### D6 — BFF only (no browser → Consumet)

- Prefer Next route handlers / server components. Ignore permissive CORS on Consumet for app architecture.

### D7 — Notifications: daily poll, drop webhook

- **Choice:** Inngest cron (~daily) loads distinct favorited `(provider, externalMangaId)`, calls Consumet info, compares newest chapter id/number to last notified / last known watermark (new field e.g. `lastNotifiedChapterId` on favorite or side table), creates `NEW_CHAPTER` notifications + existing email/push paths.
- **Why:** Scrapers have no push; daily matches stakeholder preference and reduces load vs hourly.
- **Alternatives:** Keep MangaDex webhook for MD-only titles — rejected once MD client is removed.

### D8 — “Change source” = new listing

- Favoriting MangaHere One Piece does not auto-link MangaPill. Optional later UI: “Search other providers” with same query. Progress is not portable across providers in v1.

### D9 — Cover (and page) image proxy

- **Choice:** Browser never loads scrape CDN covers directly. `GET /api/catalog/cover` fetches with provider Referer + concurrency limit; `CatalogCover` retries once then shows placeholder.
- **Why:** MangaHere/MangaPill CDNs anti-hotlink; parallel search stampedes caused mass 502s.
- **Note:** Reader pages already use chapter page proxy similarly.

### D10 — Search chapter-count enrichment

- **Choice:** After search returns listings, UI calls `GET /api/manga/[provider]/[mangaId]/chapter-count` (Consumet info → `chapters.length`) with concurrency 3 and shows “N caps” on each card.
- **Why:** Search payloads lack counts; comparing completeness across providers is a primary multiprovider UX need.
- **Trade-off:** Info is heavier than search; cache 1h and never block the initial result list.

## Risks / Trade-offs

- [Provider outages] → Show per-provider errors; keep searching other providers; allowlist degradable.
- [Poll delay up to ~24h] → Document SLA; allow manual “check now” later if needed.
- [Rate limits / long info responses] → Batch favorites; reuse Consumet Redis; short Next `revalidate`; cap concurrent fetches (covers + chapter-count enrichment).
- [Legal/scrape ToS] → Document risk; prefer official APIs where acceptable; no affiliate framing of illegal sources in product copy.
- [Image hotlink / Referer] → Mitigated via `/api/catalog/cover` (+ reader page proxy); some CDN assets still 403 (show placeholder).
- [Rollback] → Reverting code without schema rollback leaves provider columns; keep migration reversible (rename columns forward-only with wipe is simple but destructive).

## Migration Plan

1. Ship Consumet client + BFF behind feature completeness for search/detail/reader (staging against Wayool URL).
2. Apply Prisma schema (`provider` + external IDs); run wipe script on target Neon branch.
3. Point UI + favorites/history APIs at new fields; remove MangaDex client imports.
4. Disable/remove webhook route; enable daily Inngest cron.
5. Update docs/env; smoke against Consumet Wayool (Naruto/One Piece multi-provider).
6. Rollback: redeploy previous app revision only works if DB still has old columns — plan wipe window when ready to cut over (no dual-write needed given empty data).

## Open Questions

- Prefer MangaHere vs MangaPill for **sort order** when both match? Default remains provider label + chapter-count badge (user compares); optional later: sort by `chapterCount` desc.
- Exact cron cadence (02:00 UTC daily vs “every 24h from deploy”)? Prefer fixed daily schedule.
- Whether to keep webhook route as no-op stub for a release (return 410) vs delete immediately. → **410 stub shipped.**
