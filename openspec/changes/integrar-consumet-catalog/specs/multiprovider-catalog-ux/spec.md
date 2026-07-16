## ADDED Requirements

### Requirement: Multi-provider search results
The search experience SHALL allow querying manga across the configured Consumet provider allowlist and MUST display each hit with its `provider` so the user can distinguish sources.

#### Scenario: User searches a title available on multiple providers
- **WHEN** the user searches “One Piece” (or any query) and more than one allowlisted provider returns results
- **THEN** the UI lists results grouped or labeled by provider without forcing a single invisible default provider

#### Scenario: Partial provider failure
- **WHEN** one provider errors or times out during a multi-provider search
- **THEN** results from successful providers are still shown and the failed provider is indicated as unavailable or omitted with a non-blocking notice

### Requirement: User selects provider listing
Opening a manga detail, starting a reader, or adding a favorite MUST use the provider and external id of the listing the user selected — not a globally assumed default provider.

#### Scenario: User opens MangaHere listing
- **WHEN** the user selects a MangaHere search result for a title
- **THEN** detail and subsequent reads use `provider=mangahere` and that result’s `id`

#### Scenario: Same title other provider is a different listing
- **WHEN** the user later selects the same title from MangaPill
- **THEN** the system treats it as a distinct manga identity (`provider` + `id`) and does not overwrite the prior listing’s identity

### Requirement: Loading empty and error states
Search, detail, and reader views SHALL present explicit loading, empty, and error states, including retry where a Consumet call failed.

#### Scenario: Empty search
- **WHEN** all queried providers return no results
- **THEN** the UI shows an empty state (not a generic crash)

#### Scenario: Read failure
- **WHEN** chapter page fetch fails
- **THEN** the UI shows an error with a retry action

### Requirement: Optional soft preference only
If an environment preference such as `CONSUMET_MANGA_PROVIDER` exists, it MAY influence tool/debug single-provider mode or result ordering, but MUST NOT hide other allowlisted providers from end-user search in the default product configuration.

#### Scenario: Soft preference set
- **WHEN** `CONSUMET_MANGA_PROVIDER=mangahere` is set and multi-provider search is enabled
- **THEN** other allowlisted providers still appear in search results for the user

### Requirement: Chapter count cue on search results
Search results SHALL surface an approximate chapter count per listing (when resolvable via Consumet info) so the user can compare completeness across providers before opening a detail page.

#### Scenario: Counts enrich after search
- **WHEN** a multi-provider search returns listings
- **THEN** the UI shows each result’s provider and, after bounded background enrichment, a chapter count (or a degraded “unavailable” cue if info fails)

#### Scenario: Counts do not block search
- **WHEN** chapter-count enrichment is slow or partially fails
- **THEN** search titles/covers remain usable and enrichment continues without blocking the initial result list
