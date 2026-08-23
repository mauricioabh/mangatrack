## Purpose

Detects newly published chapters on favorited manga via the daily Consumet poll and creates in-app (and push) alerts based on a per-favorite watermark, not the user’s reading position.

## ADDED Requirements

### Requirement: Latest published chapter drives the watermark comparison
The favorite chapter poll MUST resolve the latest published chapter for a manga using the same latest-chapter rules as the library/dashboard (prefer newest by published date when available; otherwise a documented list-order fallback). It MUST NOT treat an arbitrary first list entry as latest when a better latest resolution exists.

#### Scenario: Published date newer than list head
- **WHEN** the chapter list’s first entry is not the newest by published date
- **THEN** the poll compares and advances `lastNotifiedChapterId` against the newest-by-published chapter id

#### Scenario: No published dates available
- **WHEN** chapters lack usable published dates
- **THEN** the poll falls back to the same list-order latest rule used by library latest-chapter resolution

### Requirement: Notify on new published chapter independent of reading progress
For each favorite with an existing `lastNotifiedChapterId`, when the resolved latest chapter id differs from that watermark, the system MUST create an in-app `NEW_CHAPTER` notification for that user. Reading history and whether the user has opened the latest chapter MUST NOT prevent that notification. Push MAY be sent when the user has registered device tokens.

#### Scenario: User behind on reading still gets notified
- **WHEN** a favorite’s latest published chapter id changes and the user has not read that chapter
- **THEN** an in-app NEW_CHAPTER notification is created for that user

#### Scenario: User already on latest still gets notified for a newer release
- **WHEN** a favorite’s latest published chapter id advances past `lastNotifiedChapterId`
- **THEN** an in-app NEW_CHAPTER notification is created regardless of existing reading history

### Requirement: First poll seeds without flooding
When a favorite has no `lastNotifiedChapterId`, the poll MUST set the watermark to the current latest chapter id without creating a NEW_CHAPTER notification for that run.

#### Scenario: New favorite first poll
- **WHEN** a favorite is polled and `lastNotifiedChapterId` is null
- **THEN** the watermark is set to the current latest chapter id and no NEW_CHAPTER notification is created on that run

### Requirement: Multi-chapter gap notifies once for the latest
When more than one chapter was published since the last successful poll, the system MUST notify for the current latest chapter and advance the watermark to that chapter id (not one notification per intermediate chapter).

#### Scenario: Several chapters between polls
- **WHEN** three chapters are newer than `lastNotifiedChapterId` at poll time
- **THEN** the user receives one NEW_CHAPTER notification targeting the latest chapter and the watermark becomes that chapter’s id
