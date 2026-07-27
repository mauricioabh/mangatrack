---
linear_story_id: WAY-89
linear_story_identifier: WAY-89
linear_story_title: "[MAN] Library: Details en tile y click abre último capítulo leído"
linear_story_url: https://linear.app/wayool/issue/WAY-89/man-library-details-en-tile-y-click-abre-ultimo-capitulo-leido
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

Library tiles currently link entirely to the manga detail page, so resuming a series always costs an extra tap. Users want the tile to open the last chapter they were reading (same resume rule as Continue Reading / WAY-88), with an explicit **Details** control when they need metadata, chapter list, or library actions.

## What Changes

- Split library tile interaction: primary click → reader at continue/resume chapter; **Details** → manga detail page.
- Enrich bookmarks API (or equivalent) so each tile has a resolvable continue chapter id without a second Consumet round-trip from the client.
- Reuse `getChapterToContinue` / last-`readAt` semantics from `continue-reading` (WAY-88); do not reintroduce “first unread gap”.
- Keep Start Reading (no history) and Re-read from start (all chapters read); if no chapter can be resolved, fall back to Details.

## Capabilities

### New Capabilities

- `library-tile-navigation`: Library tile click targets — primary area opens resume/start/re-read chapter in the reader; Details opens the manga detail page.

### Modified Capabilities

- (none)

## Impact

- `src/components/DashboardContent.tsx` — tile structure (primary link + Details)
- `src/app/api/manga/bookmarks/route.ts` — expose continue chapter id (and optionally chapter number) per favorite
- `src/lib/reading-progress.ts` — reuse existing continue helpers (no new resume rule)
- Linear: [WAY-89](https://linear.app/wayool/issue/WAY-89/man-library-details-en-tile-y-click-abre-ultimo-capitulo-leido); related [WAY-88](https://linear.app/wayool/issue/WAY-88)

## Non-goals

- Changing library progress-bar derivation or filter UX
- Separate “next unread” CTA on the tile
- In-chapter page resume

## Risks

- Nested interactive elements if Details sits inside a single wrapping `<Link>` — avoid invalid nested anchors.
- Depends on correct last-`readAt` continue helpers (WAY-88); orphan chapter ids need the same fallback as detail CTA.
- Bookmarks payload already hydrates Consumet per favorite — adding continue id is cheap if computed during that pass; avoid shipping full chapter lists to the client.
