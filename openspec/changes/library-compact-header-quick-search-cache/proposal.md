---
linear_story_id: "WAY-96"
linear_story_identifier: "WAY-96"
linear_story_title: "[MAN] Library: header compacto, búsqueda rápida y cache de carga"
linear_story_url: "https://linear.app/wayool/issue/WAY-96/man-library-header-compacto-busqueda-rapida-y-cache-de-carga"
linear_story_state: "In Progress"
linear_team: "Wayool"
linear_project: "mangatrack"
---

## Why

Library is the most-used authenticated surface, but its header wastes vertical space (title row + chip row) and every visit / window focus re-hydrates all favorites via Consumet. Users with many bookmarks need a faster find-in-library path and snappier revisits without a heavier server cache stack.

## What Changes

- Move All / New / Finished chips to the right of the Library title row (count badge stays beside the title).
- Add a client-side quick search input under the title that filters favorites by title and author (AND with chip filters); query is session-only (not persisted).
- Add client library load cache: show last bookmarks payload immediately when available, refresh in background; invalidate on favorite add/remove, Finished toggle, and reading-progress writes; stop blind refetch on every `window` focus.
- Extend empty / “Showing X of Y” behavior to cover quick search as well as chips.

## Capabilities

### New Capabilities
- `library-load-cache`: Client stale-first cache for Library bookmarks hydration, focus throttling, and invalidation on library-mutating actions.

### Modified Capabilities
- `library-filters`: Compact header layout (chips right of title), quick search filter (title + author), and count/empty states that include search.

## Impact

- Code: `src/components/DashboardContent.tsx`; small shared helper for library cache (e.g. `src/lib/library-cache.ts`); call invalidation from bookmark / Finished / reading-history client paths that already mutate library state.
- APIs: none required (no schema, no Redis).
- Specs: delta `library-filters`; new `library-load-cache`.
- Business brief: [WAY-96](https://linear.app/wayool/issue/WAY-96/man-library-header-compacto-busqueda-rapida-y-cache-de-carga).

## Non-goals

- Server-side Redis/Upstash cache for assembled library JSON.
- Changes to `/search` catalog UX or Consumet search contracts.
- Neon schema / preferences fields for the quick-search query.
