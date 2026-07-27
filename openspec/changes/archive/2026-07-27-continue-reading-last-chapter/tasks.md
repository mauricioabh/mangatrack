## 1. Reading progress helpers

- [x] 1.1 Update `getChapterToRead` / `getContinueReadingLabel` (or add `getChapterToContinue`) to prefer `lastReadChapterId` when history exists and not all chapters are read
- [x] 1.2 Update `tests/reading-progress.test.ts` for mid-series resume, next-session chapter, start, and re-read cases

## 2. Manga detail CTA

- [x] 2.1 Track `lastReadChapterId` from `/api/reading-history` (first row by `readAt` desc) alongside `readChapterIds`
- [x] 2.2 Wire CTA click + label to the new continue helper
- [x] 2.3 Refresh `lastReadChapterId` on focus/visibility history refresh

## 3. Verify

- [x] 3.1 Run reading-progress unit tests
- [x] 3.2 Run typecheck on touched files if available
