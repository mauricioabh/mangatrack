---
linear_story_id: "WAY-98"
linear_story_identifier: "WAY-98"
linear_story_title: "[MAN] My Library: Sort junto al título"
linear_story_url: "https://linear.app/wayool/issue/WAY-98/man-my-library-sort-junto-al-titulo"
linear_story_state: "In Progress"
linear_team: "Wayool"
linear_project: "mangatrack"
---

## Why

Sort currently sits on the chips row trailing edge, competing with filter chips. Users want Sort immediately beside the My Library title so ordering is easier to find without crowding the chip toolbar.

## What Changes

- Move the Sort control to the title row, immediately to the right of My Library + count badge.
- Keep quick search on the title row trailing edge.
- Chips row shows only All / New / Reading / Finished (no Sort).

## Capabilities

### New Capabilities
- _(none)_

### Modified Capabilities
- `library-filters`: Header layout — Sort beside title instead of chips-row trailing edge.

## Impact

- Code: `DashboardContent.tsx` layout only.
- Specs: delta `library-filters`.
- Business brief: [WAY-98](https://linear.app/wayool/issue/WAY-98/man-my-library-sort-junto-al-titulo).

## Non-goals

- Changing sort modes, persistence, or chip filter semantics.
