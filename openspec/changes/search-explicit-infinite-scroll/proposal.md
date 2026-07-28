---
linear_story_id: WAY-95
linear_story_identifier: WAY-95
linear_story_title: "[MAN] Búsqueda explícita, infinite scroll y loading con libro"
linear_story_url: https://linear.app/wayool/issue/WAY-95/man-busqueda-explicita-infinite-scroll-y-loading-con-libro
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

Search-as-you-type on `/search` fires many multi-provider Consumet requests, races stale responses, and caps the list without a way to load more. Users need explicit submit, safe loading UX, and honest pagination without a fake global total.

## What Changes

- Search runs only on explicit submit (Search button / Enter) or initial `?q=` deep link — not on every keystroke or filter tweak.
- Abort in-flight search and ignore stale responses; lock input, Search, Filters, and result grid during primary search.
- Multi-provider infinite scroll with end-of-list sentinel; no global result total in the heading.
- Technical dedupe on append by `provider:id` only (same title across providers stays separate).
- Shared book-only loading animation (no status text) for search waits and reader cold-path entertainment.
- API exposes `hasMore` (from provider `hasNextPage`) for pagination.

Non-goals: real catalog-wide totals; collapsing same series across providers; changing relevance ranking or provider allowlist.

## Capabilities

### New Capabilities

- `search-pagination`: Explicit search submit, abort/stale safety, infinite scroll sentinel, `hasMore` contract, locked chrome while searching.

### Modified Capabilities

- `search-toolbar`: Clear / filter changes no longer auto-refresh results until the user submits search; results heading omits fake totals.
- `reader-cold-path-ux`: Cold-path book entertainment is animation-only (no status messaging text).

## Impact

- `src/app/search/page.tsx` — submit model, infinite scroll, loading UI, lock chrome.
- `src/app/api/manga/search/route.ts` + `src/lib/consumet/service.ts` — page/`hasMore` for multi-provider.
- `src/app/reader/.../page.tsx` — remove cold-path status text lines.
- Optional shared loading component under `src/components/`.
- Docs: `docs/MANGA_SOURCE.md` search behavior note if contract changes.
