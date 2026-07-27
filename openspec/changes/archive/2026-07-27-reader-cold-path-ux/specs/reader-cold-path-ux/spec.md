## ADDED Requirements

### Requirement: Reader unblocks scans without waiting on manga info
The reader SHALL fetch chapter page proxy URLs independently of manga info / chapter-list metadata and SHALL begin rendering scans when the page list is available, even if manga title or neighbor chapters are still loading.

#### Scenario: Pages arrive before meta
- **WHEN** the pages endpoint returns successfully and meta is still in flight
- **THEN** the reader shows chapter page images (or per-image placeholders) without waiting for meta

#### Scenario: Meta fills chrome later
- **WHEN** meta returns after pages are already shown
- **THEN** the reader updates title and prev/next chapter controls from meta without reloading pages

### Requirement: Chapter page list can be warmed before reader mount
The system SHALL allow starting chapter page-list resolution when the user indicates intent to open a chapter (e.g. pointer down on a chapter link or continue action) so a subsequent reader load can hit a warm cache when possible.

#### Scenario: Warm on chapter intent
- **WHEN** the user presses a chapter link from manga detail or library continue that targets the reader
- **THEN** the client initiates a pages warm request for that chapter without blocking navigation

### Requirement: Loading entertainment only on prolonged waits
While chapter pages are loading, the reader SHALL show page skeletons immediately. The reader SHALL escalate to an animated book (or equivalent entertainment) only if pages are still loading after a short delay, and SHALL NOT show that entertainment when pages resolve before the delay (warm/cache path).

#### Scenario: Warm or cached load
- **WHEN** chapter pages become available before the cold-entertainment delay
- **THEN** the reader transitions from skeletons (or directly) to scans without showing the animated book stage

#### Scenario: Cold prolonged wait
- **WHEN** chapter pages are still loading after the cold-entertainment delay
- **THEN** the reader shows an animated book (or equivalent) and status messaging, and may return emphasis to page skeletons if the wait continues, until pages arrive or an error is shown
