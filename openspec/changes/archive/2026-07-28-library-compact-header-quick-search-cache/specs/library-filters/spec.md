## ADDED Requirements

### Requirement: Compact Library header with chips on the title row
The Library view MUST place the All / New / Finished chips on the same horizontal row as the Library heading, aligned toward the trailing edge. The total favorite count badge MUST remain adjacent to the Library heading. On narrow viewports the chips MAY wrap to a following line without reverting to a dedicated chips-only row above the grid when space allows a shared row.

#### Scenario: Desktop title row
- **WHEN** a signed-in user opens `/dashboard` at a typical desktop width
- **THEN** the Library title, count badge, and All / New / Finished chips appear on one row with chips on the right

#### Scenario: Narrow wrap
- **WHEN** the viewport is too narrow for title and chips on one line
- **THEN** the chips wrap without introducing an empty dedicated chrome band between title and search beyond normal flex wrap

### Requirement: Library quick search by title and author
The Library view MUST expose a text input below the title row that filters the visible favorites client-side. A favorite MUST match when the query (trimmed, case-insensitive) is a substring of the manga title or author. An empty query MUST apply no text filter. Quick search MUST compose with chip filters using AND: first apply All / New / Finished rules, then apply the text filter. The query MUST NOT be persisted to server preferences.

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

## MODIFIED Requirements

### Requirement: Showing X of Y and empty filter states
The Library heading MUST keep a badge with the total favorite count (Y). When chip filters and/or a non-empty quick-search query reduce the visible list, the UI MUST show a “Showing X of Y” (or equivalent) line where X is the visible count. Empty states MUST distinguish an empty library from a non-empty library with zero matches for the active chips and/or quick search.

#### Scenario: Filtered count
- **WHEN** chips and/or quick search reduce the visible list to X items out of Y favorites
- **THEN** the UI shows total Y and “Showing X of Y”

#### Scenario: Empty filter or search result
- **WHEN** the user has favorites but none match the active chips and/or quick-search query
- **THEN** a friendly message explains that no manga match the current filters or search (not the empty-library discover CTA alone)

#### Scenario: Empty library
- **WHEN** the user has zero favorites
- **THEN** the existing empty-library messaging/CTA remains appropriate
