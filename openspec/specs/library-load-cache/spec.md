# library-load-cache Specification

## Purpose
Client stale-first cache for Library bookmarks hydration, focus throttling, and invalidation on library-mutating actions.

## Requirements

### Requirement: Stale-first Library bookmarks paint
When the Library view opens and a valid client cache entry exists for the signed-in user’s bookmarks list, the UI MUST render that cached list without waiting for the network response, then MUST refresh bookmarks from the server in the background and replace the list when a newer successful response arrives. When no cache entry exists, the UI MUST show the normal loading state until the first successful fetch.

#### Scenario: Cache hit on open
- **WHEN** the user opens `/dashboard` and a valid library bookmarks cache entry exists
- **THEN** favorites from the cache are visible before the background fetch completes

#### Scenario: Cache miss on open
- **WHEN** the user opens `/dashboard` and no valid library bookmarks cache entry exists
- **THEN** the loading state is shown until bookmarks are fetched

#### Scenario: Background refresh updates list
- **WHEN** a background refresh returns a successful bookmarks payload
- **THEN** the Library list and the client cache are updated to that payload

### Requirement: Invalidate library cache on library mutations
After a successful client action that adds or removes a favorite, toggles Finished, or writes reading history that affects library progress, the client MUST invalidate (clear or mark stale) the library bookmarks cache so the next Library load does not permanently present pre-mutation data.

#### Scenario: Invalidate after bookmark
- **WHEN** the user successfully adds or removes a favorite
- **THEN** the library bookmarks cache is invalidated

#### Scenario: Invalidate after Finished toggle
- **WHEN** the user successfully toggles Finished on a favorite
- **THEN** the library bookmarks cache is invalidated

#### Scenario: Invalidate after reading progress write
- **WHEN** the reader successfully records reading history for a chapter
- **THEN** the library bookmarks cache is invalidated

### Requirement: Throttled Library refetch on window focus
The Library view MUST NOT unconditionally re-fetch bookmarks on every `window` focus event. A focus-driven refresh MUST run only when the cache is missing/invalid or when the last successful bookmarks fetch is older than a short threshold (on the order of one to two minutes).

#### Scenario: Rapid focus does not refetch
- **WHEN** the user focuses the window repeatedly within the throttle window after a fresh fetch
- **THEN** Library does not issue another full bookmarks hydration solely due to those focus events

#### Scenario: Stale on focus refreshes
- **WHEN** the user focuses the window and the last successful fetch is older than the throttle threshold (or cache is invalid)
- **THEN** Library refreshes bookmarks in the background
