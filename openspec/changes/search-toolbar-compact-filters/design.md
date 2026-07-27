## Context

`/search` (`src/app/search/page.tsx`) currently shows a large hero (title + subtitle), a search row that stacks on mobile (`flex-col` → `sm:flex-row`), a left-padded input with decorative Search icon, dual buttons (Search with label + Browse All), and an always-visible filter strip (status, genre, providers, exact phrase + tip). On PWA / narrow viewports this pushes results below the fold.

Search/filter **logic** (debounce, URL `?q=`, Consumet API params) stays as-is; this change is chrome only.

## Goals / Non-Goals

**Goals:**

- Maximize results viewport on mobile/PWA.
- Single-row toolbar: input grows; Search + Filters pinned right.
- Filters (status, genre, providers, exact phrase) only after opening Filters.
- Clear / reset lives inside Filters (replaces Browse All).

**Non-Goals:**

- Changing search API, providers, or result card grid.
- Redesigning dashboard "Discover Manga" CTAs.
- Global design-system overhaul beyond what Filters needs.

## Decisions

### 1. Toolbar layout

**Choice:** Always `flex flex-row items-center gap-2`; input `min-w-0 flex-1`; Search and Filters as fixed-size icon buttons (`size-11` / `h-11 w-11`), no `flex-1` on buttons.

**Why:** Guarantees one line on PWA widths; input claims remaining space until the right actions.

**Alternatives:** Keep `flex-col` under `sm` (rejected — current problem); wrap Filters under input (rejected — user wants one line).

### 2. Input chrome

**Choice:** Remove absolute Search icon and `pl-12`; use normal Input padding. Placeholder carries the “search” affordance; the right Search button is the explicit control.

**Why:** User-reported left gap is exactly that icon + padding.

### 3. Filters surface — bottom Sheet

**Choice:** Open Filters in a **bottom Sheet** (add shadcn `Sheet` / Vaul if missing). Contents: Status, Genre, Providers, Exact phrase, short tip (optional), and a **Clear** action. Closing the sheet does not discard selections — filters already apply live via existing `useEffect` (same as today).

**Why:** Bottom sheet is the dominant mobile/PWA filter pattern (maps, marketplaces, content apps): keeps context of the page, thumb-friendly, doesn’t permanently steal vertical space. Repo already has `Dialog` / `DropdownMenu`; neither fits multi-control filters as well on narrow screens. Sheet is one shadcn add and matches “popular today.”

**Alternatives considered:**

| Option | Pros | Cons |
|--------|------|------|
| Inline expand under toolbar | Zero new deps | Still pushes results; less “app-like” |
| Center Dialog | Already in repo | Less natural on phone; covers results oddly |
| DropdownMenu | Already used for providers | Poor for 4 controls + Clear |

**Active indicator:** Badge / dot on Filters when any non-default filter is set (`status ≠ all`, `genre ≠ all`, provider subset selected, or `exactMatch`).

### 4. Clear from Filters

**Choice:** Primary “Clear” (or “Clear all”) inside the Sheet resets:

- `statusFilter` → `all`
- `genreFilter` → `all`
- `selectedProviders` → `[]`
- `exactMatch` → `false`
- `searchQuery` / debounced query → `""`

…i.e. same outcome as former **Browse All**, then optionally close the Sheet.

**Why:** User asked to clean from Filters; Browse All is removed and its reset belongs here.

### 5. Search button

**Choice:** Icon-only (`Search` lucide), `aria-label="Search"`, keeps loading spinner on click / busy state. Enter in input still submits.

**Why:** Debounce already searches on type; button remains for explicit submit + a11y label.

### 6. Removals

- Page `h1` + subtitle.
- Browse All button and its dedicated toolbar slot (logic folded into Clear).

## Risks / Trade-offs

- **[Risk] Sheet dependency** → Mitigate: add via shadcn only; fallback to styled `Dialog` if Sheet add fails in CI.
- **[Risk] Filters “hidden”** → Mitigate: badge when active; keep Controls labeled clearly inside Sheet.
- **[Risk] Playwright expecting Discover / Browse All on search** → Mitigate: update selectors in apply phase.
- **[Trade-off] Live-apply filters while Sheet open** → Same as today; no separate Apply button (fewer taps). Clear is the only batch reset.

## Migration Plan

1. Implement UI on `feat/…` branch independent of library-tile change if possible (or sequential).
2. Manual check: PWA width (~390px) — one toolbar row; open Filters; Clear returns popular list.
3. No DB/env migration. Rollback = revert page + optional Sheet component.

## Open Questions

- None blocking; Sheet vs Dialog decided above (Sheet preferred).
