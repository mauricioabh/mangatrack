## Context

`DashboardContent` loads Library with three parallel fetches (`profile`, `/api/manga/bookmarks`, preferences). Bookmarks hydration calls Consumet `getMangaInfo` per favorite. A `window` `focus` listener re-runs the full load whenever the tab regains focus. Filter chips sit on their own row under the title. Business brief: WAY-96.

## Goals / Non-Goals

**Goals:**
- Dense header: title + count left; All / New / Finished right on the same flex row (wrap on narrow viewports).
- Quick search under the title filters by title and author (case-insensitive substring), AND-combined with chip filters; not persisted.
- Client cache for the bookmarks list payload so revisiting Library paints immediately, then soft-refreshes.
- Invalidate that cache when favorites, Finished, or reading progress change from known client mutation sites.
- Throttle / stop blind focus refetch.

**Non-Goals:**
- Redis / Upstash / HTTP CDN cache of the bookmarks API.
- Persisting quick-search query in Neon preferences.
- Changing Consumet hydration strategy inside `/api/manga/bookmarks`.

## Decisions

### 1. Header layout
**Choice:** Single `flex justify-between items-center flex-wrap` row: left cluster = `h1` + count badge; right cluster = chip buttons. Quick search is a full-width input on the next row.
**Alternatives:** Chips on the search row (crowds mobile); absolute-positioned chips (fragile).

### 2. Quick search composition
**Choice:** `visible = chipFilter(bookmarks) AND textMatch(title|author, q)`. Empty `q` = no text filter. “Showing X of Y” and empty-match copy apply when chips **or** `q` reduce the list.
**Alternatives:** OR composition (confusing); server search (unnecessary latency).

### 3. Library load cache
**Choice:** Module helper (`sessionStorage` keyed by user id when known, else session-scoped key after profile load) storing `{ fetchedAt, bookmarks }` JSON. On mount: if cache hit, set state immediately and `loading=false`, then background-fetch. On successful fetch, write cache. Max age optional (~5–10 min) still allows background refresh; mutations always `invalidateLibraryCache()`.
**Focus:** Replace always-on focus refetch with “refetch only if cache missing/expired or last successful fetch older than ~60–120s”.
**Alternatives:** React Query (new dep); server `unstable_cache` (auth/user-specific invalidation harder); memory-only Map (lost on full navigation remount unless layout keeps client tree).

### 4. Invalidation sites
**Choice:** Export `invalidateLibraryCache()` and call it after successful:
- `POST`/`DELETE` bookmark (`bookmark-button`, `MangaDetailContent`)
- Finished toggle (`MangaDetailContent`)
- Reading-history write that affects library progress (`reader` page after successful history POST)
**Alternatives:** TTL-only (stale New badges longer); broadcast `CustomEvent` (nice but more indirection—optional if prop drilling is awkward).

## Risks / Trade-offs

- [Stale after mutation in another tab] → `storage` event or short TTL + background refresh on focus throttle; accept cross-tab lag until focus/TTL.
- [sessionStorage size with large libraries] → store only the bookmarks API `data` array needed by UI, not full raw response extras; Basic tier caps favorites.
- [Flash of stale Finished/New] → invalidate aggressively on known mutations; background refresh always runs after paint.

## Migration Plan

- Ship behind normal deploy; no migrations.
- Rollback: revert UI + cache helper; Library returns to previous two-row header and focus refetch.

## Open Questions

- None blocking; TTL constants (e.g. 120s focus, 10m hard max) can be tuned after smoke.
