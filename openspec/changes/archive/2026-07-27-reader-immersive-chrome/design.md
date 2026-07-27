## Context

The reader at `src/app/reader/[provider]/[chapterId]/page.tsx` is a client page with a fixed gradient header (Back, title, Prev/Next chapter, Vertical/Horizontal select, Fit select) and a fixed footer (chapter nav + horizontal page counter). Chrome is always visible; padding (`pt-28` / `pb-20`) reserves space for both bars. PWA uses `display: "standalone"` in `manifest.ts`.

## Goals / Non-Goals

**Goals:**

- Immersive reading: tap toggles header; no footer.
- Consolidate chapter nav, reading mode, fit, and brightness into a right-side settings control.
- Software brightness dimming that persists across sessions.

**Non-Goals:**

- OS / hardware screen brightness APIs.
- Redesigning header colors/branding.
- Changing chapter fetch, reading-history, or same-tab navigation.
- Server-persisted reader prefs (localStorage is enough).

## Decisions

### 1. Chrome visibility state

- `chromeVisible` boolean, default `true` on chapter load.
- Toggle on pointer-up / click on the reading surface when the gesture is a tap (small movement), not a scroll drag.
- Header uses CSS transition (translate/opacity); when hidden, remove top padding so pages use full viewport.
- Do not toggle when interacting with header, settings panel, or chapter-complete modal.

**Alternatives:** Auto-hide after timeout — rejected (less predictable). Always-hide until edge swipe — harder on web.

### 2. Settings control placement and contents

- Icon button (`Settings` / `SlidersHorizontal`) on the **right** of the header.
- Opens a `Popover` (desktop) or same Popover/Dropdown that works on touch; prefer existing shadcn patterns. If Sheet is needed for mobile thumb reach, use bottom Sheet only if Popover feels cramped.
- Menu contains: Prev chapter, Next chapter, reading mode select, fit select, brightness slider, and (horizontal) page indicator + optional jump-to-first.
- Remove duplicate Prev/Next from the header row and remove the entire footer.

**Alternatives:** Left-side gear — rejected after product confirm (right side).

### 3. Software brightness

- Black overlay over page content with `opacity = 1 - brightness` (brightness in `[0.2, 1]`), `pointer-events: none`, `z-index` below chrome but above pages.
- Persist key e.g. `mangatrack.reader.brightness` in `localStorage`.
- Add shadcn `Slider` if missing (`npx shadcn@latest add slider`).

**Alternatives:** `filter: brightness()` on images — also fine; overlay is simpler for stacking. Screen Brightness API — unsupported in browsers for PWAs.

### 4. Horizontal page arrows

- Show only when `chromeVisible && readingMode === "horizontal"`.
- Keep existing left/right page buttons; do not move them into the settings menu.

### 5. Implementation shape

- Prefer keeping logic in the reader page for this change; extract a small `ReaderChrome` / `ReaderSettingsMenu` client component only if the file becomes unwieldy.
- No new API routes or Prisma changes.

## Risks / Trade-offs

- [Tap vs scroll] → Use movement threshold / ignore toggle if `touchmove` distance exceeds ~10px; rely on `click` after careful listeners.
- [Brightness overlay covers UI] → Overlay only over `<main>` pages, not the header/menu.
- [Discoverability] → Start with chrome visible so users see the settings icon once.
- [Slider dependency] → Add shadcn slider component via CLI to match design system.

## Migration Plan

- Deploy with UI-only change; no data migration.
- Rollback: revert the reader page commit.

## Open Questions

- None blocking; product decisions locked in Linear WAY-91.
