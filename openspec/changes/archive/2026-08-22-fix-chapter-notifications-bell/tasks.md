## 1. Poll: latest published chapter

- [x] 1.1 Update `poll-favorite-chapters.ts` to resolve latest via `getLatestChapterUpdate` (handle missing `chapterId`)
- [x] 1.2 Wire notify + FCM + watermark updates to that latest chapter (not `chapters[0]`)
- [x] 1.3 Add/adjust a focused unit test for latest resolution if a poll helper is extracted; otherwise rely on existing `getLatestChapterUpdate` tests + typecheck

## 2. Notification bell UX

- [x] 2.1 Make each notification row activate: mark read + navigate to `readerPath` when provider+chapterId present
- [x] 2.2 Remove separate ExternalLink / go control and the “View all notifications” footer
- [x] 2.3 Keep mark-all-read header; handle SYSTEM / no-chapter rows (mark read only)

## 3. Docs and verify

- [x] 3.1 Note poll latest-chapter alignment in `docs/MANGA_SOURCE.md` or `docs/TESTING.md` if needed
- [x] 3.2 Run typecheck (and relevant unit tests)
- [x] 3.3 Commit, push, confirm Vercel production deploy ready for PWA test
