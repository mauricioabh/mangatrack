---
linear_story_id: WAY-91
linear_story_identifier: WAY-91
linear_story_title: "[MAN] Lector inmersivo: chrome ocultable, menú de controles y brillo"
linear_story_url: https://linear.app/wayool/issue/WAY-91/man-lector-inmersivo-chrome-ocultable-menu-de-controles-y-brillo
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

The chapter reader keeps a fixed header and footer with many controls always on screen, which wastes space on mobile/PWA and breaks the immersive reading feel. Users need chrome that tucks away on tap and settings that do not crowd the page.

## What Changes

- Remove the fixed bottom footer from the manga reader.
- Toggle header (chrome) visibility on tap/click in the reading area (PWA-friendly immersive mode).
- Collapse chapter prev/next, reading orientation, and image fit into a settings icon on the **right** of the header; Back to manga stays on the left.
- Add a software brightness slider (CSS overlay / filter) persisted in `localStorage` — not OS screen brightness (unavailable in PWAs).
- Show horizontal page counter in the header (when chrome is visible); hide page-nav arrows with chrome.

## Capabilities

### New Capabilities

- `reader-immersive-chrome`: Immersive reader UI — hideable chrome, consolidated controls menu, software brightness.

### Modified Capabilities

- (none — `same-tab-reader` navigation behavior is unchanged)

## Impact

- Primary: `src/app/reader/[provider]/[chapterId]/page.tsx`
- UI: may add shadcn `Slider`, `Popover`/`DropdownMenu`/`Sheet` if not already present
- Client-only prefs: `localStorage` for brightness (and optionally reading mode/fit later)
- No API, schema, or env changes
- Non-goals: OS brightness control; full visual redesign of header branding; changing same-tab navigation
- Risks: tap-to-toggle conflicting with scroll / horizontal page buttons — must ignore taps on interactive chrome and distinguish scroll from intentional tap
