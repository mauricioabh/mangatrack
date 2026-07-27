## 1. Schema and preferences

- [x] 1.1 Add `User.libraryFilterNew`, `User.libraryFilterFinished`, and `UserFavorite.finishedAt`; migrate Neon; update `docs/DATA_MODEL.md`
- [x] 1.2 Extend `userPreferencesSchema` + GET/PATCH `/api/user/preferences` for library filter flags

## 2. Finished + notifications APIs

- [x] 2.1 Expose `isFinished` on bookmarks list; add PATCH (or bookmark action) to toggle `finishedAt`
- [x] 2.2 Clear `finishedAt` for matching favorites when notifying NEW_CHAPTER (`notify-favorite-users` or callers)
- [x] 2.3 In `POST /api/reading-history`, mark matching unread `NEW_CHAPTER` notifications as read

## 3. Manga detail UX

- [x] 3.1 Same-tab navigation: `router.push` / `Link` without `_blank` for Start/Continue and chapter list
- [x] 3.2 Finished toggle button next to Start/Library (only when bookmarked); wire to finished API

## 4. Library filters UX

- [x] 4.1 Load preferences + chips All/New/Finished with OR filter logic, Showing X of Y, empty states, Finished tile badge
- [x] 4.2 Persist chip changes via preferences PATCH

## 5. Verify

- [x] 5.1 Run typecheck/lint on touched areas; fix regressions
