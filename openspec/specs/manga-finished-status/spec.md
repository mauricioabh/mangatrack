# manga-finished-status Specification

## Purpose
User-declared Finished state on library favorites, with toggle and auto-clear on new chapters.

## Requirements

### Requirement: Toggle Finished on manga detail
While a series is in the user’s Library, manga detail MUST offer a Finished control that toggles the favorite’s finished state on and off. Finished series MUST remain in Library and MUST continue to receive new-chapter notifications/alerts.

#### Scenario: Mark finished
- **WHEN** the user activates Finished on a bookmarked manga detail
- **THEN** the favorite is stored as Finished and the control reflects the active state

#### Scenario: Unmark finished
- **WHEN** the user activates Finished again on a Finished manga
- **THEN** the finished state is cleared

#### Scenario: Not in library
- **WHEN** the manga is not in the user’s Library
- **THEN** the Finished control MUST be unavailable or no-op until the series is favorited

### Requirement: Auto-clear Finished on new chapter
When the system notifies the user of a new chapter for a Finished favorite, the finished state MUST be cleared so the series is no longer treated as Finished (and can appear under New when unread).

#### Scenario: New chapter for finished series
- **WHEN** a NEW_CHAPTER notification path runs for a favorite that is Finished
- **THEN** that favorite’s finished flag is cleared as part of handling the new chapter
