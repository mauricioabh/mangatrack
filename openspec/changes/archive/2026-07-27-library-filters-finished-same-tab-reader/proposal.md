---
linear_story_id: "WAY-87"
linear_story_identifier: "WAY-87"
linear_story_title: "[MAN] Library filters (New/Finished) + same-tab reader + Finished toggle"
linear_story_url: "https://linear.app/wayool/issue/WAY-87/man-library-filters-newfinished-same-tab-reader-finished-toggle"
linear_story_state: "Todo"
linear_team: "Wayool"
linear_project: "mangatrack"
---

## Why

Opening chapters in a new tab breaks the PWA “app” feel (system browser). Library users also need a durable way to focus on series with unread new chapters and on series they marked Finished, with the same filter state on desktop and mobile.

## What Changes

- Manga detail: Start/Continue and chapter links navigate to `/reader` **in the same tab** (no `window.open` / `target="_blank"`).
- Library (`/dashboard`): chips **All / New / Finished**; New+Finished = **OR**; empty states; **Showing X of Y** with fixed total badge.
- Persist `libraryFilterNew` and `libraryFilterFinished` on the user in Neon (shared across devices).
- Favorites gain a **Finished** state; detail page toggle on/off; stays in Library; still receives chapter alerts; **new chapter notify clears Finished**.
- Marking a chapter read also marks matching `NEW_CHAPTER` notifications as read.

## Capabilities

### New Capabilities

- `same-tab-reader`: Chapter entry from manga detail always uses same-tab navigation.
- `library-filters`: Library filter chips All/New/Finished (OR), persistence, empty copy, Showing X of Y.
- `manga-finished-status`: User-declared Finished on favorites; toggle; auto-clear on new chapter.
- `chapter-read-clears-notifications`: Reading a chapter dismisses related NEW_CHAPTER notifications.

### Modified Capabilities

- `library-progress-ux`: Library header/count interaction with filters (Showing X of Y); optional Finished affordance on tiles.

## Impact

- `MangaDetailContent.tsx`, `DashboardContent.tsx`, reader history API, bookmark APIs, preferences API, Prisma `User` + `UserFavorite`, notify-favorite / chapter-published path (clear Finished), `docs/DATA_MODEL.md` / `docs/ENV.md` if needed.

## Non-goals

- Muting push/email for Finished series.
- Removing Finished series from Library.
- Changing notification copy or email templates beyond marking read.

## Risks

- Filter OR semantics must be documented in UI (both chips = union).
- Clearing Finished on every new chapter may surprise users who marked Finished while still behind; accepted product rule.
