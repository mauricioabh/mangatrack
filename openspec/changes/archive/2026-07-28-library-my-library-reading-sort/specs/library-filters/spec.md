## MODIFIED Requirements

### Requirement: Library filter chips All / New / Finished
The Library view MUST expose four chips: **All**, **New**, **Reading**, and **Finished**. All is active when New, Reading, and Finished are all off. Activating New and/or Reading and/or Finished MUST deactivate All. Activating All MUST clear New, Reading, and Finished. When one or more of New / Reading / Finished are on, the visible set MUST be the union (OR) of matches (no duplicate tiles). A favorite matches **New** when `hasUnreadLatest === true` and the favorite is not Finished. A favorite matches **Reading** when `isReading === true` and the favorite is not Finished. A favorite matches **Finished** when it is marked Finished. Finished favorites MUST NOT match the Reading chip.

#### Scenario: Default All
- **WHEN** server-stored New, Reading, and Finished filter flags are all false
- **THEN** All is selected and the full library list is shown

#### Scenario: New only
- **WHEN** New is on and Reading and Finished are off
- **THEN** only non-Finished favorites with `hasUnreadLatest === true` are shown

#### Scenario: Reading only
- **WHEN** Reading is on and New and Finished are off
- **THEN** only favorites with `isReading === true` that are not Finished are shown

#### Scenario: Finished only
- **WHEN** Finished is on and New and Reading are off
- **THEN** only favorites marked Finished are shown

#### Scenario: Reading excludes Finished
- **WHEN** Reading is on and a favorite is Finished (even if it has reading history)
- **THEN** that favorite MUST NOT appear solely due to the Reading chip

#### Scenario: New and Reading and Finished union
- **WHEN** any combination of New, Reading, and Finished is on
- **THEN** the list shows the union (OR) of matching favorites (no duplicate tiles)

### Requirement: Persist library filters on the server
The user’s New, Reading, and Finished filter flags MUST be stored on the user record in Neon and loaded when opening Library so desktop and mobile share the same filter state.

#### Scenario: Cross-device consistency
- **WHEN** the user enables Reading on one device and later opens Library on another signed-in session
- **THEN** Reading is still enabled and the filtered list matches that preference

#### Scenario: Toggle persists
- **WHEN** the user toggles a filter chip
- **THEN** the app persists the new flags via the preferences API (or equivalent) without requiring a full page reload to keep UI in sync

### Requirement: Compact Library header with chips on the title row
The Library view MUST place the quick-search input on the same horizontal row as the **My Library** heading, aligned toward the trailing edge. The total favorite count badge MUST remain adjacent to the heading. The All / New / Reading / Finished chips MUST appear on a row below the title row, aligned toward the leading edge, with the Sort control on that same row toward the trailing edge. On narrow viewports title/search and chips/Sort MAY wrap without introducing empty dedicated chrome bands beyond normal flex wrap.

#### Scenario: Desktop title row
- **WHEN** a signed-in user opens `/dashboard` at a typical desktop width
- **THEN** My Library, the count badge, and the quick-search input appear on one row with search on the right

#### Scenario: Desktop chips row
- **WHEN** a signed-in user opens `/dashboard` at a typical desktop width
- **THEN** All / New / Reading / Finished chips appear on the leading edge of the next row and the Sort control appears on the trailing edge of that row

#### Scenario: Narrow wrap
- **WHEN** the viewport is too narrow for a single unbroken title or chips row
- **THEN** controls wrap without introducing an empty dedicated chrome band beyond normal flex wrap

### Requirement: Library quick search by title and author
The Library view MUST expose a text input on the title row that filters the visible favorites client-side. A favorite MUST match when the query (trimmed, case-insensitive) is a substring of the manga title or author. An empty query MUST apply no text filter. Quick search MUST compose with chip filters using AND: first apply All / New / Reading / Finished rules, then apply the text filter, then apply Sort. The query MUST NOT be persisted to server preferences.

#### Scenario: Title match
- **WHEN** the user types a string contained in a favorite’s title
- **THEN** that favorite remains visible (subject to active chips) and non-matching titles/authors are hidden

#### Scenario: Author match
- **WHEN** the user types a string contained in a favorite’s author and not in its title
- **THEN** that favorite remains visible (subject to active chips)

#### Scenario: AND with New
- **WHEN** New is active and the user enters a quick-search query
- **THEN** only favorites that both match New and match the query are shown

#### Scenario: Query not persisted
- **WHEN** the user enters a quick-search query, navigates away, and later returns to Library
- **THEN** the quick-search input is empty (unless the client still holds in-memory state for an uninterrupted mount) and the server preferences API is not used to store the query

### Requirement: Showing X of Y and empty filter states
The Library heading MUST keep a badge with the total favorite count (Y). When chip filters and/or a non-empty quick-search query reduce the visible list, the UI MUST show a “Showing X of Y” (or equivalent) line where X is the visible count. Empty states MUST distinguish an empty library from a non-empty library with zero matches for the active chips and/or quick search. Changing Sort alone MUST NOT by itself trigger the empty-filter messaging when X equals Y.

#### Scenario: Filtered count
- **WHEN** chips and/or quick search reduce the visible list to X items out of Y favorites
- **THEN** the UI shows total Y and “Showing X of Y”

#### Scenario: Empty filter or search result
- **WHEN** the user has favorites but none match the active chips and/or quick-search query
- **THEN** a friendly message explains that no manga match the current filters or search (not the empty-library discover CTA alone)

#### Scenario: Empty library
- **WHEN** the user has zero favorites
- **THEN** the existing empty-library messaging/CTA remains appropriate

## ADDED Requirements

### Requirement: Library client sort control
The Library view MUST expose a Sort control on the chips row (trailing edge) with at least: Updated newest first (default), Updated oldest first, Title A–Z, and Title Z–A. Sort MUST reorder the list after chip and quick-search filters. Updated sort MUST use each favorite’s latest chapter published date when available. Title sort MUST use the manga title with case-insensitive locale-aware comparison. The selected sort mode MUST be persisted on the user record and restored when opening Library.

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
