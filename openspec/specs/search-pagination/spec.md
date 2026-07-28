# search-pagination Specification

## Purpose
Explicit search submit, abort-safe loading, and multi-provider infinite scroll without fake global totals.

## Requirements

### Requirement: Explicit search submit

The search page SHALL run a catalog search only when the user activates the Search control, presses Enter in the search input, or when the page initializes with a non-empty `q` query parameter. Typing in the search input or changing filter controls alone SHALL NOT trigger `/api/manga/search`.

#### Scenario: Typing does not search

- **WHEN** the user types in the search input without submitting
- **THEN** the client does not call `/api/manga/search`

#### Scenario: Submit runs search

- **WHEN** the user activates Search or presses Enter with a query
- **THEN** the client calls `/api/manga/search` with the current query and filters

#### Scenario: Deep link q param

- **WHEN** the user opens `/search?q=<term>`
- **THEN** the client performs one search for that term on load

#### Scenario: Filter change alone

- **WHEN** the user changes status, genre, providers, or exact-phrase without submitting search
- **THEN** the client does not call `/api/manga/search` until the next explicit submit

### Requirement: Abort and lock during primary search

While a primary search (page 1 / replace) is in flight, the search page SHALL disable or otherwise prevent interaction with the search input, Search button, Filters controls, and existing result tiles. The client SHALL abort any previous in-flight search request when starting a new primary search and SHALL ignore responses that are not for the latest search generation.

#### Scenario: Chrome locked while searching

- **WHEN** a primary search is loading
- **THEN** the input, Search control, Filters, and result links are not actionable

#### Scenario: Stale response ignored

- **WHEN** a newer search has started before an older response returns
- **THEN** the older response does not replace the newer results

### Requirement: Infinite scroll without global total

The search results heading SHALL NOT display a global catalog total count. When more provider pages are available, scrolling to the end of the results list SHALL load the next page and append items. The UI SHALL show an end-of-list sentinel indicating loading more or that no more results are available. Append SHALL dedupe only by `provider` + `id` (same title on different providers MAY appear as separate rows).

#### Scenario: Heading without total

- **WHEN** search results are shown
- **THEN** the results heading does not include a parenthetical total count of all matching catalog items

#### Scenario: Load more on scroll

- **WHEN** results are shown, `hasMore` is true, and the end sentinel enters the viewport
- **THEN** the client requests the next page and appends new unique `provider:id` rows

#### Scenario: End of results

- **WHEN** `hasMore` is false and at least one result is shown
- **THEN** the sentinel indicates that there are no more results

#### Scenario: Same series different providers

- **WHEN** the same title appears from two providers with different ids
- **THEN** both rows remain in the list

### Requirement: Search API exposes hasMore

`GET /api/manga/search` SHALL accept `page` and return pagination that includes whether another page may be available (`hasMore`), derived from upstream provider `hasNextPage` (OR across providers used). Soft `limit` slicing of the merged page MAY still apply.

#### Scenario: hasMore true

- **WHEN** at least one searched provider reports a next page for the requested page
- **THEN** the response pagination indicates `hasMore` true

#### Scenario: Page parameter

- **WHEN** the client requests `page=2`
- **THEN** the service queries providers with page 2 and returns that merged batch

### Requirement: Book-only search loading mark

While a primary search is in progress after a short delay (or immediately if preferred), the search page SHALL show an animated book loading mark without status text copy. The mark SHALL NOT display rotating status phrases or instructional sentences.

#### Scenario: Book without copy

- **WHEN** primary search loading is shown
- **THEN** an animated book is visible
- **AND** no status message text accompanies the book
