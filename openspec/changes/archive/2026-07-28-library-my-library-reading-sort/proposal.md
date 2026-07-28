---
linear_story_id: "WAY-97"
linear_story_identifier: "WAY-97"
linear_story_title: "[MAN] My Library: chip Reading, header reordenado y sort"
linear_story_url: "https://linear.app/wayool/issue/WAY-97/man-my-library-chip-reading-header-reordenado-y-sort"
linear_story_state: "Todo"
linear_team: "Wayool"
linear_project: "mangatrack"
---

## Why

Library users need to filter in-progress series and reorder favorites without exclusive “segments.” The current header puts chips beside the title and leaves quick search full-width below; Reading exists as a tile badge but not as a list filter, and sort is fixed server-side (latest chapter desc).

## What Changes

- Rename the authenticated library heading from **Library** to **My Library**.
- Reorder chrome: title row = **My Library** + count badge + quick-search input on the trailing edge; second row = filter chips on the left (**All / New / Reading / Finished**) and a **Sort** control on the right.
- Add **Reading** chip: multi-select OR with New/Finished (same model as today); match = `isReading && !isFinished`. All clears New/Reading/Finished.
- Add client sort: Updated desc (default), Updated asc, Title A–Z, Title Z–A; apply after chip + quick-search filters.
- Persist `libraryFilterReading` (and sort preference) on the user record via preferences API, same cross-device pattern as New/Finished.

## Capabilities

### New Capabilities
- _(none)_

### Modified Capabilities
- `library-filters`: Header layout (search on title row; chips + Sort on second row), Reading chip (OR filters), client sort modes, and preferences for Reading + sort.
- `library-progress-ux`: Surface naming **My Library** (replacing Library heading requirement).

## Impact

- Code: `DashboardContent.tsx`; preferences route + Zod validations; Prisma `User` fields for Reading filter and sort.
- Specs: delta `library-filters`, `library-progress-ux`.
- Docs: `docs/DATA_MODEL.md` when schema fields are added.
- Business brief: [WAY-97](https://linear.app/wayool/issue/WAY-97/man-my-library-chip-reading-header-reordenado-y-sort).

## Non-goals

- Exclusive segment tabs (New | Reading | Finished as mutually exclusive views).
- Changing Consumet hydration or server sort contract beyond what the client needs for Updated/title sort.
- Redis / server-side library list cache.
