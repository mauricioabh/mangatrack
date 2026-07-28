## 1. Library client cache helper

- [x] 1.1 Add `src/lib/library-cache.ts` with read/write/invalidate helpers (sessionStorage, user-scoped key, fetchedAt)
- [x] 1.2 Export TTL constants for focus throttle (~60–120s) and optional hard max age

## 2. Dashboard UI: header + quick search

- [x] 2.1 Compact title row: Library + count left; All / New / Finished chips right (`justify-between` + wrap)
- [x] 2.2 Add quick-search input under the title; filter by title/author AND chip filters
- [x] 2.3 Extend “Showing X of Y” and empty-match copy for search ± chips; keep empty-library CTA distinct

## 3. Dashboard load: stale-first + focus throttle

- [x] 3.1 On mount, paint cached bookmarks when present, then background-fetch and write cache on success
- [x] 3.2 Replace always-on focus refetch with throttle / stale-only refresh
- [x] 3.3 Keep preferences + profile fetch behavior coherent with cache path (no flicker of wrong filters)

## 4. Invalidation on mutations

- [x] 4.1 Call `invalidateLibraryCache` after successful bookmark add/remove (`bookmark-button`, `MangaDetailContent`)
- [x] 4.2 Call invalidate after successful Finished toggle
- [x] 4.3 Call invalidate after successful reading-history write in the reader

## 5. Verify

- [x] 5.1 `npm run typecheck` / lint clean for touched files
- [x] 5.2 Manual smoke: compact header, quick search AND chips, cache hit on revisit, invalidate after favorite/Finished/read
