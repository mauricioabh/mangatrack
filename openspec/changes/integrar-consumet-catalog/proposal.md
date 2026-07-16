## Why

MangaDex alone no longer is a reliable reading catalog for MangaTrack: licensed titles (e.g. One Piece) show almost no chapters via Consumet/MangaDex, while scrape-backed providers on the self-hosted Consumet instance expose full series. We already operate Consumet at `https://consumet.wayool.com`; the app should use that as the **only** catalog backend, let users pick a provider per title in search, and replace MangaDex webhooks with a daily poll for new-chapter notifications.

## What Changes

- **BREAKING**: Remove direct MangaDex API client usage (`api.mangadex.org`) and the MangaDex chapter webhook as the catalog/notif path.
- Integrate a typed Consumet HTTP client against `CONSUMET_BASE_URL` (Wayool VPS; no Consumet deploy in this change).
- Multi-provider manga search: query one or more providers; results show `provider` + **chapter-count** coverage cues; user selects which listing to open/favorite.
- Domain models and BFF for search, detail (+ chapters), and reader pages normalized from Consumet shapes.
- **BREAKING** Neon schema: store `provider` + `externalMangaId` / `externalChapterId` on favorites, reading history, and related notifications; **wipe** existing manga-linked user rows (expected near-empty) instead of migrating UUID-only MangaDex IDs.
- Daily cron (Inngest or equivalent) that polls Consumet `info` for favorited `(provider, id)` pairs and emits new-chapter notifications; remove reliance on `/api/webhook/mangadex`.
- BFF **cover proxy** for scrape CDN hotlink Referers; chapter page proxy for reader images.
- Env/docs: `CONSUMET_BASE_URL`, optional provider allowlist/timeouts; update `MANGA_SOURCE` / `ENV` / data model docs.
- Linear tracking (Wayool): `[MAN] Integrar Consumet API self-hosted`.

### Non-goals

- Deploying or changing Consumet Docker/nginx/Cloudflare on the VPS.
- Using public `api.consumet.org`.
- Automatic cross-provider ID merge (Anilist/MAL mapping) in v1 — “change source” = new search + new favorite entry.

### Risks

- Scraping providers are fragile (route breaks, 404s); UX must surface errors + retry and never assume one global complete catalog.
- Legal/ToS exposure of scrape-backed reading; product responsibility sits with MangaTrack + Consumet usage policy.
- Daily poll has delay (up to ~24h) vs near-real-time webhooks; rate-limit and batch favorites carefully.

## Capabilities

### New Capabilities

- `consumet-catalog`: Server-side Consumet client + BFF contracts for search, manga info/chapters, and chapter page reads; provider-aware IDs; no browser-direct Consumet calls.
- `multiprovider-catalog-ux`: Search and detail/reader flows where the user chooses provider per manga; loading/empty/error; no hard UX default that hides other providers.
- `provider-scoped-library`: Neon favorites/history/notifications keyed by `(provider, externalId)`; wipe legacy MangaDex-only rows; APIs and dashboard hydration against Consumet.
- `chapter-poll-notifications`: Daily job that detects new chapters for favorites via Consumet info polling; removes MangaDex webhook dependency.

### Modified Capabilities

- _(none — no existing `openspec/specs/` yet)_

## Impact

- Code: replace `src/lib/mangadex/*` consumers with Consumet catalog layer; API routes `/api/manga/*`, `/api/chapters/*`; reader/search/dashboard UI; Inngest functions; drop or gut `/api/webhook/mangadex`.
- Database: Prisma models `UserFavorite`, `ReadingHistory`, `Notification` field renames/additions + unique indexes; one-off wipe script or documented truncate.
- Env: `CONSUMET_BASE_URL` (and timeouts/allowlist); deprecate `MANGADEX_*` catalog vars.
- Ops: Depends on existing Wayool Consumet (Redis-cached); cron schedule in Inngest/Vercel.
- Docs: `docs/MANGA_SOURCE.md`, `docs/ENV.md`, `docs/DATA_MODEL.md`, `.env.example`, phases/README as needed.
