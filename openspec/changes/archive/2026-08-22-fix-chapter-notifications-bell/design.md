## Context

See proposal.md for motivation. The daily Inngest function `poll-favorite-chapters-daily` loads favorites, calls `getMangaInfo`, and compares `lastNotifiedChapterId` to `info.chapters[0]`. Library bookmarks already use `getLatestChapterUpdate` from `@/lib/consumet`. The bell UI is `NotificationDropdown` + `useNotifications`; API already returns `chapterId` / `provider` but the row only links to manga detail via a separate icon, and “View all” links to `/dashboard`.

## Goals / Non-Goals

**Goals:**

- Align poll latest-chapter resolution with `getLatestChapterUpdate`.
- Preserve seed / notify / unchanged / error outcomes and FCM path.
- Tile-first bell UX: open reader + mark read; remove View all and separate go control.

**Non-Goals:**

- Changing cron schedule or Inngest architecture
- Notifications history page
- Global foreground FCM toast listener (optional follow-up; push still works in background via SW)
- Splash screen color on Android/iOS

## Decisions

1. **Reuse `getLatestChapterUpdate` in the poll**  
   Single source of truth with bookmarks. Alternative: duplicate publishedAt scan in the poll (rejected—drift risk).

2. **When `getLatestChapterUpdate` returns no `chapterId`**  
   Treat as empty (same as no chapters)—do not notify or advance watermark blindly.

3. **Tile click = `router.push(readerPath)` + `markAsRead`**  
   Use Next.js client navigation; mark read via existing PATCH. Prefer whole-row button/link over nested icon buttons. Keep “mark all read” in the header.

4. **Remove View all entirely**  
   Product choice from explore: dropdown already lists all API notifications. Alternative (new `/notifications` page) deferred.

5. **Catch-up after deploy**  
   Favorites stuck with an outdated watermark will notify once for current latest on next successful poll—acceptable.

## Risks / Trade-offs

- [One-time catch-up notifs after fix] → Expected; not a per-missed-chapter flood.
- [Providers without dates still use list[0] via helper] → Same limitation as library badges.
- [SYSTEM notifications without chapterId] → Mark read only; no reader navigation.

## Migration Plan

- Deploy code only; no schema change.
- Validate: Inngest invoke `poll-favorite-chapters-daily` in prod (or wait for cron `0 2 * * *`), confirm Neon `notifications` + bell + optional FCM.
- Rollback: revert commit.

## Open Questions

- None for implementation.
