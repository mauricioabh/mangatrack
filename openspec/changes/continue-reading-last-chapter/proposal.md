---
linear_story_id: WAY-88
linear_story_identifier: WAY-88
linear_story_title: "[MAN] Continue Reading debe ir al último capítulo leído"
linear_story_url: https://linear.app/wayool/issue/WAY-88/man-continue-reading-debe-ir-al-ultimo-capitulo-leido
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

On the manga detail page, **Continue Reading** currently jumps to the first unread chapter in list order. Users who start mid-series (e.g. only chapter 100 in history) see “Continue — Ch. 1” and lose their place. Resume should open the chapter from the user’s latest reading session.

## What Changes

- Change continue-reading target from “first unread gap” to “chapter with most recent `readAt`”.
- Update the CTA label to show that chapter’s number.
- Keep “Start Reading” when there is no history; keep “Re-read from start” when every listed chapter is already read.
- Update unit tests for the reading-progress helpers and wire the detail page to pass ordered history (not only a Set of ids).

## Capabilities

### New Capabilities

- `continue-reading`: Manga detail CTA resumes the last chapter the user was reading (`readAt` desc), with labels and navigation aligned to that chapter.

### Modified Capabilities

- (none)

## Impact

- `src/lib/reading-progress.ts` — target/label helpers
- `src/components/MangaDetailContent.tsx` — preserve `readAt` / ordered history for the CTA
- `tests/reading-progress.test.ts`
- Linear: [WAY-88](https://linear.app/wayool/issue/WAY-88/man-continue-reading-debe-ir-al-ultimo-capitulo-leido)

## Non-goals

- Separate “next unread” CTA
- In-chapter page progress
- Changing library tile progress-bar derivation

## Risks

- Low: if chapter ids in history no longer appear in the Consumet chapter list, fall back to first chapter / Start behavior gracefully.
