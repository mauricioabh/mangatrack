## Context

`DashboardContent` currently shows **Library** with chips (All / New / Finished) on the title row and quick search full-width below. Bookmarks API already returns `isReading`, `hasUnreadLatest`, `isFinished`, and `latestChapter.publishedAt`. Server sorts by latest chapter date desc. Preferences persist `libraryFilterNew` / `libraryFilterFinished` only. Tile Reading badge already exists; there is no Reading list filter or client sort UI. Business brief: WAY-97.

## Goals / Non-Goals

**Goals:**
- Header: **My Library** + count; quick search on title row trailing edge.
- Second row: chips All / New / Reading / Finished (left) + Sort control (right).
- Reading chip = `isReading && !isFinished`; OR with New/Finished; All clears all three flags.
- Client sort after filters: `updated_desc` (default), `updated_asc`, `title_asc`, `title_desc`.
- Persist Reading filter + sort preference on User via preferences API.

**Non-Goals:**
- Exclusive segment tabs.
- Changing Consumet hydration strategy.
- Removing tile Reading/Finished badges or New dot.

## Decisions

### 1. Keep multi-select OR chips (no segments)
**Choice:** Extend existing New/Finished OR model with Reading.  
**Why:** User rejected exclusive segmentation; Reading is another filter facet, not a status tab.  
**Alt:** Exclusive All|New|Reading|Finished — rejected.

### 2. Reading predicate
**Choice:** `isReading === true && !isFinished`. Finished series never match Reading even if history exists.  
**Why:** Explicit product rule; Finished chip owns finished favorites.

### 3. Layout
**Choice:**
```
[ My Library  N ]     [ Find in library… ]
[ All New Reading Finished ]        [ Sort ▾ ]
```
**Why:** Title stays scannable; search is primary find action; chips + sort share the secondary toolbar.

### 4. Sort implementation
**Choice:** Client-side on the already-hydrated list. Updated = parse `latestChapter.publishedAt` (missing → treat as epoch / end for stable order with `createdAt` tie-break). Title = `localeCompare` on `manga.title`.  
**Why:** Payload already has the fields; avoids re-querying Consumet.  
**Alt:** Server `?sort=` — unnecessary while full list is client-loaded.

### 5. Persistence
**Choice:** Add `libraryFilterReading Boolean @default(false)` and `librarySort String @default("updated_desc")` (or enum-like validated string) on `User`; wire preferences GET/PATCH + Zod.  
**Why:** Same cross-device pattern as existing filter flags. Sort default matches current API order.

### 6. Sort UI
**Choice:** Dropdown / select labeled Sort with four options; place trailing on chips row.  
**Why:** Compact; no permanent four-button clutter.

## Risks / Trade-offs

- [Narrow viewports] → Title + search wrap; chips + Sort wrap; keep flex-wrap, no empty chrome band.
- [Missing publishedAt] → Stable fallback via `createdAt` so sort does not thrash.
- [OR of all three chips] → Nearly full library; acceptable; All remains the clear reset.
- [Schema migration] → Additive booleans/string only; `db:push` / migrate safe.

## Migration Plan

1. Prisma fields + preferences API + validations.
2. DashboardContent layout, Reading chip, sort pipeline.
3. Update DATA_MODEL.md.
4. Rollback: revert UI + prefs fields (or ignore unused columns).

## Open Questions

- None blocking; sort persistence confirmed yes for parity with filters.
