## MODIFIED Requirements

### Requirement: Compact Library header with chips on the title row
The Library view MUST place the Sort control immediately to the right of the **My Library** heading and total favorite count badge on the title row. The quick-search input MUST remain on the same title row toward the trailing edge. The All / New / Reading / Finished chips MUST appear on a row below the title row, aligned toward the leading edge, without the Sort control on that chips row. On narrow viewports title/search/Sort and chips MAY wrap without introducing empty dedicated chrome bands beyond normal flex wrap.

#### Scenario: Desktop title row
- **WHEN** a signed-in user opens `/dashboard` at a typical desktop width
- **THEN** My Library, the count badge, and the Sort control appear together on the leading side of the title row, and the quick-search input appears on the trailing side

#### Scenario: Desktop chips row
- **WHEN** a signed-in user opens `/dashboard` at a typical desktop width
- **THEN** All / New / Reading / Finished chips appear on the leading edge of the next row and Sort is not on that chips row

#### Scenario: Narrow wrap
- **WHEN** the viewport is too narrow for a single unbroken title or chips row
- **THEN** controls wrap without introducing an empty dedicated chrome band beyond normal flex wrap

### Requirement: Library client sort control
The Library view MUST expose a Sort control on the title row (immediately after the My Library heading and count badge) with at least: Updated newest first (default), Updated oldest first, Title A–Z, and Title Z–A. Sort MUST reorder the list after chip and quick-search filters. Updated sort MUST use each favorite’s latest chapter published date when available. Title sort MUST use the manga title with case-insensitive locale-aware comparison. The selected sort mode MUST be persisted on the user record and restored when opening Library.

#### Scenario: Default Updated desc
- **WHEN** the user has not chosen another sort (or stored preference is Updated newest first)
- **THEN** visible favorites are ordered by latest chapter date descending

#### Scenario: Title A–Z
- **WHEN** the user selects Title A–Z
- **THEN** visible favorites are ordered by title ascending

#### Scenario: Sort after filters
- **WHEN** New is active and the user changes Sort to Title Z–A
- **THEN** only New-matching favorites are shown, ordered by title descending

#### Scenario: Sort preference persists
- **WHEN** the user selects Updated oldest first and later opens Library on another signed-in session
- **THEN** Updated oldest first remains selected and the list order matches
