# library-filters Specification

## Purpose
Library filter chips (All / New / Finished) with server-persisted preferences and clear empty/count states.

## Requirements

### Requirement: Library filter chips All / New / Finished
The Library view MUST expose three chips: **All**, **New**, and **Finished**. All is active when both New and Finished are off. Activating New and/or Finished MUST deactivate All. Activating All MUST clear New and Finished.

#### Scenario: Default All
- **WHEN** both server-stored filter flags are false
- **THEN** All is selected and the full library list is shown

#### Scenario: New only
- **WHEN** New is on and Finished is off
- **THEN** only favorites with `hasUnreadLatest === true` are shown

#### Scenario: Finished only
- **WHEN** Finished is on and New is off
- **THEN** only favorites marked Finished are shown

#### Scenario: New and Finished union
- **WHEN** New and Finished are both on
- **THEN** the list shows the union (OR) of unread-latest and Finished favorites (no duplicate tiles)

### Requirement: Persist library filters on the server
The user’s New and Finished filter flags MUST be stored on the user record in Neon and loaded when opening Library so desktop and mobile share the same filter state.

#### Scenario: Cross-device consistency
- **WHEN** the user enables New on one device and later opens Library on another signed-in session
- **THEN** New is still enabled and the filtered list matches that preference

#### Scenario: Toggle persists
- **WHEN** the user toggles a filter chip
- **THEN** the app persists the new flags via the preferences API (or equivalent) without requiring a full page reload to keep UI in sync

### Requirement: Showing X of Y and empty filter states
The Library heading MUST keep a badge with the total favorite count (Y). When any filter is active, the UI MUST show a “Showing X of Y” (or equivalent) line where X is the filtered count. Empty states MUST distinguish an empty library from a non-empty library with zero filter matches.

#### Scenario: Filtered count
- **WHEN** filters reduce the visible list to X items out of Y favorites
- **THEN** the UI shows total Y and “Showing X of Y”

#### Scenario: Empty filter result
- **WHEN** the user has favorites but none match the active filters
- **THEN** a friendly message explains that no manga match the current filters (not the empty-library discover CTA alone)

#### Scenario: Empty library
- **WHEN** the user has zero favorites
- **THEN** the existing empty-library messaging/CTA remains appropriate
