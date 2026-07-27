---
linear_story_id: WAY-94
linear_story_identifier: WAY-94
linear_story_title: "[MAN] Reader: cold-path split + dynamic loading UX"
linear_story_url: https://linear.app/wayool/issue/WAY-94/man-reader-cold-path-split-dynamic-loading-ux
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

Page-list caching and always-on skeletons were not enough: cold Consumet waits still felt stuck, and the reader blocked scans on manga info. Users need faster first-scan unblock plus loading UI that stays quiet on warm/cache and only entertains on cold waits.

## What Changes

- Split chapter fetch: `fields=pages` (scans) vs `fields=meta` (chrome/neighbors); reader unblocks when pages arrive
- Warm/prefetch page list (+ first image) on chapter click from detail, library continue, and in-reader hops
- Dynamic loading stages by elapsed wait: skeleton immediately; escalate to animated book only if still loading (~1.6s); then skeletons again (~3.4s) — warm/cache never sees the book theater
- Formalize behavior already shipped in PRs #47 and #48

## Capabilities

### New Capabilities

- `reader-cold-path-ux`: Unblock scans from manga-info wait, prefetch warm path, and time-based cold-only loading entertainment

### Modified Capabilities

- `reader-loading-performance`: Clarify that initial skeletons apply while waiting for **pages**, and failures are for page-list load (not only full metadata)

## Impact

- `src/app/api/chapters/.../route.ts` — `fields=pages|meta`
- `src/app/reader/.../page.tsx` — split fetch + loading stages
- `src/lib/consumet/reader-warm.ts`, detail/dashboard links
- `src/app/animations.css` — reader book animation
- No schema/env; no **BREAKING** client contract beyond additive query param

## Non-goals

- Redis / cross-instance shared cache
- Cover-image timed placeholder cascade
- Changing Consumet providers

## Risks

- Time thresholds approximate cold vs warm; very slow “warm” may briefly show book UI
- Prefetch is best-effort (auth/network)
