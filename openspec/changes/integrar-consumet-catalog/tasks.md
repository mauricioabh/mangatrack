## 1. Env and Consumet client

- [x] 1.1 Add `CONSUMET_BASE_URL`, optional `CONSUMET_TIMEOUT_MS`, optional `CONSUMET_PROVIDER_ALLOWLIST` (and optional soft `CONSUMET_MANGA_PROVIDER`) to `.env.example` and `docs/ENV.md`
- [x] 1.2 Create `src/lib/consumet/` (client, types, mappers, errors) with `searchManga`, `getMangaInfo`, `getChapterPages`
- [x] 1.3 Map Consumet payloads to domain types `MangaSummary`, `MangaDetail`, `Chapter`, `Page` including title fallback
- [x] 1.4 Enforce timeouts/retries and typed handling of `{ message, error }` JSON; smoke against `https://consumet.wayool.com`

## 2. Neon schema and wipe

- [x] 2.1 Update Prisma: favorites/history/notifications to `provider` + `externalMangaId` / `externalChapterId` (+ watermark field for poll, e.g. on favorite)
- [x] 2.2 Add unique/indexes per design; generate client
- [x] 2.3 Add wipe script or documented SQL to clear legacy favorites, reading history, and manga-linked notifications before/at push
- [x] 2.4 Apply to target Neon branch (`db:push` / migrate) with approval; update `docs/DATA_MODEL.md`

## 3. BFF routes (replace MangaDex)

- [x] 3.1 Wire `/api/manga/search` to multi-provider Consumet search (partial failure tolerant)
- [x] 3.2 Wire `/api/manga/[mangaId]` (or provider+id route shape) to `getMangaInfo`
- [x] 3.3 Wire chapter/reader APIs to `getChapterPages` / reader payload
- [x] 3.4 Update bookmark and reading-history APIs to accept/store provider-scoped ids
- [x] 3.5 Remove or stop using `src/lib/mangadex` catalog calls (`api.mangadex.org`); delete dead modules after cutover

## 4. UI multiprovider flows

- [x] 4.1 Search UI: show provider label per result; user selects listing to open
- [x] 4.2 Detail + chapter list loading/empty/error + retry
- [x] 4.3 Reader loading/error/retry; pass selected provider through routes/state
- [x] 4.4 Favorites/dashboard hydration via provider-scoped Consumet info

## 5. Chapter poll notifications

- [x] 5.1 Implement Inngest (or existing scheduler) daily cron to poll favorites via Consumet info
- [x] 5.2 Compare against watermark; create `NEW_CHAPTER` + reuse email/push helpers; skip duplicates
- [x] 5.3 Continue on per-favorite failures; bound concurrency
- [x] 5.4 Disable/remove `/api/webhook/mangadex` and related MangaDex webhook parsing; update docs

## 6. Docs, Linear, verify

- [x] 6.1 Update `docs/MANGA_SOURCE.md`, `docs/PHASES.md` (and README/SETUP API notes if contracts changed)
- [x] 6.2 Create Linear issue `[MAN] Integrar Consumet API self-hosted` (labels MAN + Feature, project mangatrack) if not exists
- [x] 6.3 Run typecheck/lint; manual smoke: multi-provider search, One Piece on MangaHere/MangaPill, favorite wipe empties, poll dry-run
- [x] 6.4 Run `/post-implementation` checklist before commit

## 7. Follow-up delta (covers + completeness)

- [x] 7.1 BFF cover proxy `/api/catalog/cover` + `CatalogCover` (Referer, concurrency, retry, placeholder)
- [x] 7.2 Search chapter-count enrichment via `/api/manga/[provider]/[mangaId]/chapter-count` + “N caps” badge
- [x] 7.3 Update multiprovider UX spec + design decisions D9/D10
