## MODIFIED Requirements

### Requirement: Browse navigation entry

The signed-in app chrome MUST expose a Browse control that navigates to `/browse` (English) or `/es/browse` (Spanish) according to the active locale.

#### Scenario: Header icon

- **WHEN** a signed-in user views the global header
- **THEN** a Browse control is visible and links to the browse route for the active locale

### Requirement: Browse page sections

The Browse page MUST offer New releases, Latest updates, and Trending discovery modes.

#### Scenario: Mode switch

- **WHEN** the user opens `/browse` or `/es/browse`
- **THEN** they can switch among New releases, Latest updates, and Trending

### Requirement: Trending time windows

Trending MUST support Today, Week, and Month period controls that change the feed query window.

#### Scenario: Period change

- **WHEN** the user selects Week on Trending
- **THEN** the feed reloads using the Week window (not the previous period's cached list)

## ADDED Requirements

### Requirement: Browse state in URL

The browse page MUST encode the active mode and period in URL query parameters so feeds are shareable and reload-safe.

#### Scenario: Share trending week link

- **WHEN** a user selects Trending and Week on browse
- **THEN** the URL reflects `mode` and `period` (or equivalent param names)
- **AND** reloading the page loads the same feed

#### Scenario: Default URL without params

- **WHEN** a user opens `/browse` without query params
- **THEN** default mode and period apply (New releases + Week or existing product defaults)
