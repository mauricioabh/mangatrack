## 1. Catalog providers (mangadex + comick)

- [x] 1.1 Update `DEFAULT_ALLOWLIST` / defaults to `mangahere,mangapill,mangadex,comick` in `src/lib/consumet/client.ts` and search `DEFAULT_PROVIDERS`
- [x] 1.2 Update `.env.example`, `docs/ENV.md`, `docs/MANGA_SOURCE.md` (document weebcentral excluded)
- [x] 1.3 Extend `PROVIDER_REFERERS` + cover/`next.config` remotePatterns for mangadex/comick CDNs as needed
- [x] 1.4 Adjust Jest allowlist/search-relevance tests for new defaults; keep weebcentral out
- [x] 1.5 Set Vercel/`env.local` `CONSUMET_PROVIDER_ALLOWLIST` to the same CSV (ops note in docs)

## 2. Library progress UX

- [x] 2.1 Add helper(s) to derive `isReading`, progress ratio / chapter stats from history + chapter list (`src/lib/reading-progress.ts` or adjacent)
- [x] 2.2 Enrich `/api/manga/bookmarks` response with progress fields without Prisma schema changes
- [x] 2.3 Update `DashboardContent`: heading Library; Reading badge; progress bar on tiles
- [x] 2.4 Unit tests for progress derivation edge cases (no history, unknown total, completed)

## 3. Browse feeds BFF + UI

- [x] 3.1 Add `src/lib/browse/` MangaDex feed client (New / Latest / Trending + period windows) with timeouts; document Consumet exception in code comment + MANGA_SOURCE
- [x] 3.2 Add `GET /api/browse` (or per-feed routes) with Zod validation for mode + period
- [x] 3.3 Create `/browse` page UI (modes + Today/Week/Month) with loading/empty/error states
- [x] 3.4 Add Browse control to `GlobalHeader` linking to `/browse`
- [x] 3.5 Wire card navigation to `/manga/mangadex/{id}` when UUID usable, else search-by-title fallback
- [x] 3.6 Ensure middleware/auth matches search/dashboard expectations for `/browse` and `/api/browse`

## 4. Verification

- [x] 4.1 `npm run typecheck` (or project equivalent) and lint clean on touched files
- [x] 4.2 Run Jest suites for consumet + new progress/browse helpers
- [x] 4.3 Manual smoke: search mangadex/comick; Library badge/bar; Browse feeds load
- [x] 4.4 Optional Linear follow-up issue for weebcentral CF on Consumet VPS (do not enable in allowlist)
