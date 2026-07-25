## Context

MangaTrack already uses Consumet BFF (`CONSUMET_BASE_URL` → `consumet.wayool.com`) with allowlist default `mangahere,mangapill`. Favorites hydrate via `/api/manga/bookmarks` (latest chapter + `hasUnreadLatest`). Reading progress helpers exist in `src/lib/reading-progress.ts` for detail/reader, but the dashboard does not show progress bars or a “Reading” badge. There is no Browse surface.

Consumet VPS handoff (2026-07-25): `mangadex` and `comick` return 200; `weebcentral` is mounted but 500 (Cloudflare challenge). Consumet routes do **not** expose real recent/trending feeds (`/manga/*/recent` is a text search).

Stakeholders: WAY-81 (mangatrack / Wayool).

## Goals / Non-Goals

**Goals:**

- Library UX: rename, Reading badge, progress bar derived from Neon history + Consumet totals.
- Browse UX: header entry + `/browse` with New / Latest / Trending and Today|Week|Month.
- Expand client allowlist to include `mangadex` and `comick` end-to-end (search → detail → reader).

**Non-Goals:**

- Persist library status/rating/tags; Import MAL; social/XP.
- Enable `weebcentral` or change Consumet Docker on the VPS.
- Replace search (`/search`) with Browse; both coexist.

## Decisions

### 1. Library progress without schema change

- **Choice:** Derive on the bookmarks API (or a thin helper used by it):
  - `isReading` = any `ReadingHistory` row for `(userId, provider, externalMangaId)`.
  - `readChapterCount` / `latestReadChapterNumber` from history ∩ chapter list (or max chapterNumber among read ids).
  - `totalChapters` from Consumet `info` (already fetched for latest chapter).
  - Progress ratio = `latestReadChapterNumber / totalChapters` (clamp 0–1); if totals unknown, omit bar.
- **Why:** Matches product ask with zero Prisma migration.
- **Alternatives:** Persist `status`/`progress` columns — deferred.

### 2. Browse feeds via MangaDex API (metadata only)

- **Choice:** New server-only module `src/lib/browse/` calling `https://api.mangadex.org` for ordered manga lists:
  - **New releases:** `order[createdAt]=desc` + optional `createdAtSince` for period windows.
  - **Latest updates:** `order[latestUploadedChapter]=desc` + time filter when available.
  - **Trending:** `order[followedCount]=desc` (period approximated with `updatedAt`/`createdAt` window or followedCount global + UI period tabs; document limitation).
- Cards link into app search/detail preferring `provider=mangadex` when the title UUID matches; otherwise deep-link search by title.
- Reading chapters remain Consumet-only (including mangadex via Consumet).
- **Why:** Consumet lacks feed endpoints; MD public API is free and already used historically for covers patterns.
- **Alternatives considered:**
  - Fake feeds via Consumet search strings — rejected (bad UX).
  - Extend Consumet VPS — out of scope this change.
- **Constraint:** Document this as an explicit **browse-metadata exception** to “catalog reads via Consumet”; do not reintroduce full MangaDex reader client.

### 3. Provider allowlist

- **Choice:** Default + docs: `mangahere,mangapill,mangadex,comick`. Never default-include `weebcentral`.
- Update `DEFAULT_ALLOWLIST`, `.env.example`, search `DEFAULT_PROVIDERS`, `PROVIDER_REFERERS`, `next.config` remotePatterns as needed for ComicK/MD CDNs.
- **Why:** Matches live smoke on Wayool Consumet.

### 4. Auth / middleware

- Browse may be signed-in only (consistent with search/dashboard) unless middleware already allows public catalog — follow existing search auth pattern.
- Library remains authenticated.

## Risks / Trade-offs

- [Browse uses api.mangadex.org] → Mitigation: isolate in `lib/browse`, timeout, no secrets; docs call out exception; reader still Consumet.
- [Bookmarks N+1 / heavy info] → Mitigation: reuse existing concurrency limits; compute progress from already-fetched detail when possible.
- [ComicK CDN Referer] → Mitigation: extend referers + cover proxy; fail soft on cover.
- [Trending period imperfect on MD] → Mitigation: label UI honestly; prefer followedCount + documented window.
- [weebcentral still 500] → Mitigation: exclude from allowlist; optional Linear follow-up ops issue.

## Migration Plan

1. Deploy Consumet allowlist env on Vercel (`CONSUMET_PROVIDER_ALLOWLIST`).
2. Ship app: Library + providers first (low risk), then Browse BFF + UI.
3. Rollback: revert deploy; env can drop mangadex/comick without data migration.
4. No DB migrate/rollback needed.

## Open Questions

- Exact MangaDex query params for Week/Month trending quality — spike during apply if first cut looks weak.
- Whether Browse cards should open `/manga/mangadex/{uuid}` directly when Consumet mangadex info succeeds, vs always going through search — prefer direct if id is MD UUID.
