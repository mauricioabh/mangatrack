## 1. UI primitive

- [x] 1.1 Add shadcn `Sheet` (bottom sheet) under `src/components/ui/` if not already present
- [x] 1.2 Verify Sheet opens/closes and traps focus on a smoke render

## 2. Search toolbar chrome

- [x] 2.1 Remove Discover Amazing Manga heading and subtitle from `src/app/search/page.tsx`
- [x] 2.2 Rebuild toolbar as a single `flex-row`: input `flex-1 min-w-0`, Search + Filters fixed on the right
- [x] 2.3 Remove leading Search icon and `pl-12` from the input; use normal padding
- [x] 2.4 Make Search an icon-only button with accessible name; show loading state as today
- [x] 2.5 Remove Browse All from the toolbar

## 3. Filters sheet + Clear

- [x] 3.1 Move status, genre, providers, exact phrase (and optional tip) into a Filters bottom Sheet opened by the Filters button
- [x] 3.2 Add active indicator (badge/count) on Filters when any non-default filter is set
- [x] 3.3 Add Clear inside the Sheet that resets query + all filters (former Browse All behavior) and refreshes results
- [x] 3.4 Keep existing live filter → search effect behavior (no separate Apply unless needed for a11y)

## 4. Verify

- [x] 4.1 Manually check ~390px / PWA: one toolbar row; filters only after open; Clear works
- [x] 4.2 Update any Playwright or copy assertions broken by Discover/Browse All removals on search
- [x] 4.3 Run `npm run typecheck` (and lint if part of local habit) on touched files
