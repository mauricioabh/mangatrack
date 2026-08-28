## Purpose

Improve async data fetching and shareable filter state on search and browse while preserving instant library paint from sessionStorage cache.

## ADDED Requirements

### Requirement: TanStack Query for dashboard data

The dashboard MUST fetch bookmarks, user profile, and preferences through TanStack Query with deduplication and background refetch.

#### Scenario: Deduped concurrent fetches

- **WHEN** dashboard mounts and multiple components need bookmarks
- **THEN** only one in-flight bookmarks request runs

#### Scenario: Library cache as initial paint

- **WHEN** sessionStorage contains a fresh library cache entry for the signed-in user
- **THEN** the dashboard paints bookmarks immediately from cache while Query refetches in background

### Requirement: Search filters in URL

The search page MUST reflect query and filter state in the URL query string so links are shareable and reload-safe.

#### Scenario: Share search link

- **WHEN** a user runs a search with filters and copies the URL
- **THEN** opening that URL in a new tab restores query, filters, and page state

#### Scenario: Filter params documented

- **WHEN** filters are active
- **THEN** the URL encodes at minimum: query (`q`), status, genre, exact match flag, providers, and page when > 1

### Requirement: Browse mode and period in URL

The browse page MUST encode discovery mode and trending period in the URL query string.

#### Scenario: Share browse feed

- **WHEN** a user selects Trending + Month on browse
- **THEN** the URL reflects those selections
- **AND** reload keeps the same feed

### Requirement: Library filters stay server-persisted

Library filter chips (New / Reading / Finished) MUST continue to persist via user preferences API, not URL query params.

#### Scenario: Cross-device library filters

- **WHEN** a user toggles Reading on mobile
- **THEN** desktop library still shows Reading enabled via server preferences (unchanged behavior)
