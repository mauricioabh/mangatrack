---
linear_story_id: WAY-92
linear_story_identifier: WAY-92
linear_story_title: "[MAN] Reader Back ping-pong Library/Detail"
linear_story_url: https://linear.app/wayool/issue/WAY-92/man-reader-back-ping-pong-librarydetail
linear_story_state: In Progress
linear_team: Wayool
linear_project: mangatrack
---

## Why

Opening a series from Library into the reader, then using in-app Back, lands on manga Detail; Detail Back returns to the reader. Users bounce Reader ↔ Detail and never reach Library. The Back control should undo the entry path (history), not always push the series page.

## What Changes

- Reader in-app Back uses browser history (`back`) when a same-origin previous entry exists; otherwise falls back to the manga Detail page.
- Chapter prev/next navigates with history `replace` so chapter hops do not trap Back in a chapter trail.
- Keep same-tab navigation; do not change Library tile primary/Details targets.

## Capabilities

### New Capabilities

- `reader-back-navigation`: In-app Back and chapter-to-chapter history semantics for the manga reader.

### Modified Capabilities

- (none)

## Impact

- Primary: `src/app/reader/[provider]/[chapterId]/page.tsx`
- May touch manga Detail Back only if needed for consistency (prefer leaving Detail as `history.back`)
- No API, schema, or env changes
- Non-goals: Changing Library tile hrefs; adding a separate “Series” control in v1; redesigning reader chrome
- Risks: Deep links / cold PWA starts with empty history need a reliable Detail fallback; distinguishing same-origin history from external referrers
