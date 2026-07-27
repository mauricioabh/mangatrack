---
linear_story_id: WAY-90
linear_story_identifier: WAY-90
linear_story_title: "[MAN] Search PWA: toolbar compacta y filtros en sheet"
linear_story_url: https://linear.app/wayool/issue/WAY-90/man-search-pwa-toolbar-compacta-y-filtros-en-sheet
linear_story_state: In Progress
linear_team: Wayool
linear_project: mangatrack
---

## Why

On the search page (especially PWA / narrow viewports), the hero title, always-visible filter row, and dual action buttons waste vertical space before results. Users need a compact toolbar: search field that fills the row, icon actions on the right, and filters only when requested.

**Linear:** [WAY-90](https://linear.app/wayool/issue/WAY-90/man-search-pwa-toolbar-compacta-y-filtros-en-sheet)

## What Changes

- Remove the "Discover Amazing Manga" heading and subtitle from `/search`.
- Compact search toolbar in a **single row**: query input (`flex-1`) + icon-only **Search** + **Filters** on the right.
- Remove the decorative left search icon / extra left padding inside the input so text starts normally.
- Remove the **Browse All** button from the toolbar.
- Move status, genre, providers, and exact-phrase controls into a **Filters** surface opened by the Filters button (hidden by default).
- Add **Clear filters** inside that Filters surface (reset status/genre/providers/exact match and clear query — same as former Browse All).
- Show a visual cue on Filters when any filter is active (e.g. badge count).

## Capabilities

### New Capabilities

- `search-toolbar`: Compact search page chrome — single-row toolbar, collapsible/modal filters panel, clear-from-filters.

### Modified Capabilities

- (none — no existing OpenSpec capability covers search UI chrome)

## Impact

- **Code**: primarily `src/app/search/page.tsx`; may add shadcn `Sheet` (or reuse `Dialog`) under `src/components/ui/`.
- **APIs**: none — search/filter query behavior unchanged.
- **Tests**: any Playwright/assertions that expect "Discover Manga" on search, "Browse All", or always-visible filter labels may need updates (`tests/dashboard-loading.spec.ts` references Discover Manga as a nav/CTA elsewhere — verify scope).
- **Non-goals**: changing Consumet search API, result grid, debounce logic, or dashboard CTAs that link to search.
- **Risks**: low UI-only; watch filter accessibility (focus trap in sheet/dialog, `aria-expanded` on Filters).
