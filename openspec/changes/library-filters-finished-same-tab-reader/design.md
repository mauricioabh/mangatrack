## Context

Manga detail opens the reader via `window.open(..., "_blank")` and chapter `<a target="_blank">`, which breaks PWA standalone. Library already exposes `hasUnreadLatest` from bookmarks enrichment but has no filters. `UserFavorite` has no finished flag; preferences API only stores `emailNotifications`. Reading history POST does not touch notifications.

## Goals / Non-Goals

**Goals:**

- Same-tab reader entry from manga detail.
- Library chips All/New/Finished with OR semantics, empty states, Showing X of Y.
- Server-persisted filter flags on `User`.
- `finishedAt` (or equivalent) on `UserFavorite`; toggle on detail; clear on new-chapter notify path.
- On chapter read, mark matching `NEW_CHAPTER` notifications read.

**Non-Goals:**

- Mute alerts for Finished series.
- Remove Finished from Library.
- Redesign notification dropdown UX beyond read-state correctness.

## Decisions

1. **Same-tab navigation** — Replace `window.open` with `router.push(chapterHref)` and chapter rows with Next.js `Link` (no `target="_blank"`). Rationale: preserves PWA; Ctrl/Cmd-click still works.

2. **New filter signal** — Use existing `hasUnreadLatest` (latest chapter not in reading history), not unread notification rows. Rationale: matches “capítulo nuevo no leído”; notifications are cleaned when reading.

3. **Finished storage** — `UserFavorite.finishedAt DateTime?` (null = not finished). Rationale: simple toggle + audit timestamp; clear by setting null.

4. **Filter persistence** — `User.libraryFilterNew Boolean @default(false)` and `User.libraryFilterFinished Boolean @default(false)`. Extend GET/PATCH `/api/user/preferences`. Rationale: syncs devices; All = both false.

5. **Filter evaluation (client)** — After loading bookmarks + preferences, filter client-side with OR when both flags true. Rationale: bookmarks payload already has `hasUnreadLatest`; add `isFinished` from favorite row.

6. **Clear Finished on notify** — In `notify-favorite-users` (and any path that creates NEW_CHAPTER for a favorite), set `finishedAt = null` for that favorite before/after notify. Rationale: product rule that new content reopens the series.

7. **Clear notifications on read** — In `POST /api/reading-history`, after upserting history, `updateMany` notifications where `userId`, `type=NEW_CHAPTER`, `provider`, `externalChapterId` match (and manga id when provided). Rationale: single write path for “chapter read”.

8. **Finished API** — Extend bookmark PATCH/POST or add dedicated toggle on existing `/api/manga/bookmark` with `{ finished: boolean }` or separate small endpoint. Prefer extending bookmark route to avoid new surface area if it already toggles membership.

## Risks / Trade-offs

- [Risk] New∩Finished empty after auto-clear → Mitigated by OR semantics in UI.
- [Risk] Preferences PATCH race on rapid chip taps → Debounce or send full flag pair each toggle.
- [Risk] Prisma migration on Neon → Use additive nullable/default columns; update `docs/DATA_MODEL.md`.

## Migration Plan

1. Add Prisma fields + migrate Neon.
2. Ship API + UI together (filters default All; finished null).
3. Rollback: ignore new columns / feature-flag UI if needed; columns are additive.

## Open Questions

- None blocking; Finished control disabled when not in library is confirmed.
