## ADDED Requirements

### Requirement: Chapter page list is cached for short TTL
The system SHALL cache the resolved chapter page list (image URLs and referers) per provider and chapter id for a short TTL so that chapter metadata responses and page-image proxy requests reuse the same Consumet scrape within that window.

#### Scenario: Chapter JSON and first page proxy share one scrape
- **WHEN** an authenticated user loads a chapter and the browser immediately requests the first proxied page image
- **THEN** the server resolves the chapter page list from Consumet at most once within the cache TTL for that provider and chapter id (subsequent page-list lookups hit the cache)

#### Scenario: Cache expires and refreshes
- **WHEN** the cache TTL for a chapter page list has elapsed
- **THEN** the next request SHALL fetch a fresh page list from Consumet and replace the cached entry

### Requirement: Reader shows page skeletons while loading
The reader SHALL show page-shaped loading placeholders (skeletons) and a minimal reader chrome as soon as the reader route mounts, without waiting for chapter metadata to finish loading.

#### Scenario: Immediate feedback on open
- **WHEN** the user navigates to a chapter reader route
- **THEN** the UI displays page-shaped skeletons (or equivalent placeholders) before chapter metadata returns

#### Scenario: Content replaces skeletons after load
- **WHEN** chapter metadata returns successfully with page proxy URLs
- **THEN** the reader renders the chapter pages using those URLs and continues to allow lazy loading for pages after the first

### Requirement: Chapter load failures remain recoverable
The reader SHALL still surface a clear error state with retry when chapter metadata fails to load.

#### Scenario: Failed chapter fetch
- **WHEN** the chapter API returns an error or the client cannot load chapter metadata
- **THEN** the reader shows an error message and a retry action (skeletons alone MUST NOT be the only outcome)
