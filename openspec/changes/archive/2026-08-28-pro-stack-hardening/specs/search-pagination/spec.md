## MODIFIED Requirements

### Requirement: Explicit search submit

The search page SHALL run a catalog search only when the user activates the Search control, presses Enter in the search input, or when the page initializes with a non-empty `q` query parameter (or equivalent nuqs-managed query param). Typing in the search input or changing filter controls alone SHALL NOT trigger `/api/manga/search`.

#### Scenario: Typing does not search

- **WHEN** the user types in the search input without submitting
- **THEN** the client does not call `/api/manga/search`

#### Scenario: Submit runs search

- **WHEN** the user activates Search or presses Enter with a query
- **THEN** the client calls `/api/manga/search` with the current query and filters

#### Scenario: Deep link q param

- **WHEN** the user opens `/search?q=<term>` (or localized `/es/search?q=<term>`)
- **THEN** the client performs one search for that term on load

#### Scenario: Filter change alone

- **WHEN** the user changes status, genre, providers, or exact-phrase without submitting search
- **THEN** the client does not call `/api/manga/search` until the next explicit submit

#### Scenario: Shareable filter URL

- **WHEN** a user submits a search with active filters
- **THEN** the browser URL reflects query and filter state in query parameters
- **AND** reloading the page restores the same visible filters without losing state

## ADDED Requirements

### Requirement: URL encodes search filter state

After explicit search submit, the search page MUST sync `status`, `genre`, `match`, `providers`, and `page` (when greater than 1) into the URL alongside `q`.

#### Scenario: Copy link preserves filters

- **WHEN** a user copies the URL after searching with genre and provider filters
- **THEN** opening that URL in another tab shows the same filter UI state before or as part of the initial search bootstrap
