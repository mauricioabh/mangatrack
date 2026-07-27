## 1. Page-list cache

- [x] 1.1 Add short-TTL in-process cache around `getChapterPages` (key: provider + chapterId)
- [x] 1.2 Confirm chapter API and page proxy both use the cached path (no duplicate scrape within TTL)

## 2. Reader skeleton UX

- [x] 2.1 Replace book-only full-screen gate with minimal chrome + page-shaped skeletons while metadata loads
- [x] 2.2 Keep first page eager / remaining lazy; preserve error + retry when metadata fails
- [x] 2.3 Optional: per-image placeholder until `onLoad` for first visible pages

## 3. Verify

- [x] 3.1 Run typecheck/lint on touched files
- [x] 3.2 `openspec validate reader-loading-performance --strict`
