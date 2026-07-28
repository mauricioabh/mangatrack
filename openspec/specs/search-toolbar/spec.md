# search-toolbar Specification

## Purpose
Compact `/search` page chrome for PWA: single-row toolbar and on-demand Filters sheet.

## Requirements

### Requirement: Compact search toolbar

The search page SHALL present a single horizontal toolbar containing a search input that expands to fill available space and action controls aligned to the right (Search and Filters). The page SHALL NOT show a “Discover Amazing Manga” (or equivalent) title or supporting subtitle above the toolbar.

#### Scenario: Toolbar fits one row on narrow viewport

- **WHEN** the user views `/search` at a typical PWA phone width
- **THEN** the search input and the Search and Filters controls appear on one row
- **AND** the input occupies the space between the container edge and the right-side buttons

#### Scenario: No hero copy

- **WHEN** the user opens `/search`
- **THEN** the page does not display the Discover Amazing Manga heading or the Find your next favorite subtitle

### Requirement: Normal search input padding

The search input SHALL NOT reserve extra left padding for a decorative leading search icon. Typed text SHALL start at the input’s normal content inset.

#### Scenario: Typing starts without left icon gutter

- **WHEN** the user focuses the search input and types
- **THEN** characters appear at the normal left padding of the input
- **AND** there is no leading absolute search icon inside the field

### Requirement: Icon-only Search control

The toolbar SHALL provide an icon-only Search button (with an accessible name) that triggers search. The toolbar SHALL NOT include a Browse All button.

#### Scenario: Search button is icon-only

- **WHEN** the user views the search toolbar
- **THEN** the Search control shows a search icon without a visible “Search” text label
- **AND** the control has an accessible name such as “Search”

#### Scenario: Browse All removed

- **WHEN** the user views the search toolbar
- **THEN** no Browse All control is present

### Requirement: Filters open on demand

Status, genre, provider, and exact-phrase controls SHALL be hidden by default and SHALL become available when the user activates the Filters control. Opening Filters SHALL use a bottom sheet (or equivalent full-width mobile sheet) containing those controls.

#### Scenario: Filters hidden until opened

- **WHEN** the user lands on `/search` and has not opened Filters
- **THEN** status, genre, provider, and exact-phrase controls are not visible in the main page chrome

#### Scenario: Filters sheet contents

- **WHEN** the user activates Filters
- **THEN** a sheet opens that includes status, genre, providers, and exact phrase controls

#### Scenario: Active filters indicator

- **WHEN** at least one filter differs from its default (all status, all genres, all providers, exact phrase off)
- **THEN** the Filters control shows a visible active indicator (e.g. badge or count)

### Requirement: Clear from Filters

The Filters surface SHALL provide a Clear action that resets search query and all filters to defaults (equivalent to the former Browse All reset), so the user can return to an unfiltered state without a separate toolbar button. Clearing SHALL NOT by itself call `/api/manga/search`; results SHALL clear to the idle empty state until the user explicitly submits a new search (or lands with `?q=`).

#### Scenario: Clear resets query and filters

- **WHEN** the user has a non-empty query and/or non-default filters and activates Clear inside Filters
- **THEN** the query is cleared
- **AND** status, genre, providers, and exact phrase return to defaults
- **AND** displayed search results are cleared without an automatic catalog search request
