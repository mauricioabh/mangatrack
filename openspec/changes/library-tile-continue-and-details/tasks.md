## 1. Bookmarks API continue target

- [x] 1.1 For each favorite in `/api/manga/bookmarks`, resolve `lastReadChapterId` from history ordered by `readAt` desc
- [x] 1.2 Compute `continueChapterId` via `getChapterToContinue` (null when no chapters)
- [x] 1.3 Include `continueChapterId` on each bookmark payload (keep `manga.chapters` empty)

## 2. Library tile UI

- [x] 2.1 Update `Bookmark` type in `DashboardContent` to accept `continueChapterId`
- [x] 2.2 Replace whole-tile detail `Link` with primary `Link` to `readerPath` (fallback `mangaPath` when null)
- [x] 2.3 Add **Details** control linking to `mangaPath` without nested anchors
- [x] 2.4 Ensure Details is usable on small screens (padding / placement)

## 3. Verify

- [x] 3.1 Manual: tile click → last-read chapter; Details → detail page; no history → first chapter
- [x] 3.2 Run typecheck/lint on touched files
