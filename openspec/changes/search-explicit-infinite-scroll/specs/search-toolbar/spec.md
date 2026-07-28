## MODIFIED Requirements

### Requirement: Clear from Filters

The Filters surface SHALL provide a Clear action that resets search query and all filters to defaults (equivalent to the former Browse All reset), so the user can return to an unfiltered state without a separate toolbar button. Clearing SHALL NOT by itself call `/api/manga/search`; results SHALL clear to the idle empty state until the user explicitly submits a new search (or lands with `?q=`).

#### Scenario: Clear resets query and filters

- **WHEN** the user has a non-empty query and/or non-default filters and activates Clear inside Filters
- **THEN** the query is cleared
- **AND** status, genre, providers, and exact phrase return to defaults
- **AND** displayed search results are cleared without an automatic catalog search request
