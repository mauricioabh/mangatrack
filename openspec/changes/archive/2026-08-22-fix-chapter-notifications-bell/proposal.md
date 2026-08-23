---
linear_story_id: WAY-124
linear_story_identifier: WAY-124
linear_story_title: "[MAN] Notificaciones de capítulos nuevos rotas (poll + campanita PWA)"
linear_story_url: https://linear.app/wayool/issue/WAY-124/man-notificaciones-de-capitulos-nuevos-rotas-poll-campanita-pwa
linear_story_state: In Progress
linear_team: Wayool
linear_project: mangatrack
---

## Why

In-app and push chapter notifications stopped updating (~20 Jul 2026) even when favorites gain new published chapters. The daily poll compares against a fragile “first list item” instead of the true latest chapter, and the bell UI has dead/confusing actions. Users must be notified when the catalog gains a new chapter relative to the last notified watermark—independent of their reading progress.

## What Changes

- Fix favorite chapter poll to detect the latest **published** chapter with the same helper the library/dashboard uses (`getLatestChapterUpdate`), not `chapters[0]`.
- Keep watermark semantics: first poll seeds without flood; later polls notify when latest id ≠ `lastNotifiedChapterId` (reading history does not gate this).
- Bell dropdown: remove “View all notifications”; make the whole notification tile open the chapter reader and mark the notification read; remove the separate external-link / “Go” control.
- If multiple chapters appear between polls, one notification for the latest is acceptable (existing product nuance).

## Capabilities

### New Capabilities

- `favorite-chapter-poll`: Daily Consumet poll for favorites detects new published chapters via latest-chapter resolution and creates in-app (+ push) notifications against `lastNotifiedChapterId`.
- `notification-bell`: Header bell dropdown lists notifications; tile click opens the chapter and marks read; no dead “view all” footer.

### Modified Capabilities

- (none)

## Impact

- `src/inngest/functions/poll-favorite-chapters.ts`
- `src/components/NotificationDropdown.tsx` (+ possibly `useNotifications` / `readerPath`)
- Docs: `docs/TESTING.md` / `docs/MANGA_SOURCE.md` if poll behavior notes need a line
- Linear: [WAY-124](https://linear.app/wayool/issue/WAY-124/man-notificaciones-de-capitulos-nuevos-rotas-poll-campanita-pwa)

## Non-goals

- Dedicated notifications history page
- Real-time / sub-daily poll frequency
- PWA splash white-background fix (separate track)
- One notification per intermediate chapter when several drop between polls

## Risks

- Stale watermarks after this fix may trigger a backlog of “latest” notifications on the next successful poll for favorites that were stuck—acceptable catch-up, not a flood of every missed chapter.
- Scrapers without reliable `publishedAt` still fall back to list order via `getLatestChapterUpdate`.
