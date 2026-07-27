## Context

Manga detail (`MangaDetailContent`) uses `getChapterToRead` / `getContinueReadingLabel` from `src/lib/reading-progress.ts`. Today those helpers pick the first unread chapter by ascending `chapterNumber`, which breaks mid-series resumes. Reading history is fetched ordered by `readAt: desc` from `/api/reading-history`, but the UI collapses it to a `Set` of chapter ids and loses recency.

## Goals / Non-Goals

**Goals:**

- Resume CTA navigates to the chapter with the latest `readAt` for that manga.
- Label shows that chapter’s number when progress exists.
- Preserve Start Reading (empty history) and Re-read from start (all chapters read).

**Non-Goals:**

- Page-level resume inside a chapter
- Library tile progress formula changes
- Schema/API contract changes beyond using existing fields

## Decisions

1. **Resume key = `readAt` (session), not max chapter number**  
   Matches “último que estuve leyendo”. If the user finished 100 and opened 101, Continue goes to 101. Alternatives considered: max chapter number (fails when re-reading an earlier chapter); first unread gap (current bug).

2. **Keep helpers pure; pass last-read id + chapters into them**  
   Extend/replace `getChapterToRead` with something like `getChapterToContinue({ chapters, readChapterIds, lastReadChapterId })` so the detail page supplies `history[0].externalChapterId` (API already sorted desc). Avoid coupling helpers to full history rows.

3. **All chapters read → still “Re-read from start”**  
   Explicit product choice from acceptance criteria; do not resume last read when the series is fully marked read.

4. **Orphan last-read id**  
   If `lastReadChapterId` is missing from the current chapter list, fall back to first chapter when there is any progress, or Start when none — same as today’s empty-list safety.

## Risks / Trade-offs

- [Orphan/stale chapter ids after provider remaps] → Resolve via id lookup on current list; fallback to first chapter.
- [Set-only state loses order] → Store `lastReadChapterId` (and keep Set for read styling) from API response.

## Migration Plan

- No DB migration. Deploy code only. Rollback = revert commit.

## Open Questions

- None for implementation.
