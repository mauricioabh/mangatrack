## ADDED Requirements

### Requirement: Browse navigation entry
The signed-in app chrome MUST expose a Browse control that navigates to `/browse`.

#### Scenario: Header icon
- **WHEN** a signed-in user views the global header
- **THEN** a Browse control is visible and links to `/browse`

### Requirement: Browse page sections
The Browse page MUST offer New releases, Latest updates, and Trending discovery modes.

#### Scenario: Mode switch
- **WHEN** the user opens `/browse`
- **THEN** they can switch among New releases, Latest updates, and Trending

### Requirement: Trending time windows
Trending MUST support Today, Week, and Month period controls that change the feed query window.

#### Scenario: Period change
- **WHEN** the user selects Week on Trending
- **THEN** the feed reloads using the Week window (not the previous period’s cached list)

### Requirement: Browse cards open catalog
Each Browse result MUST link into the app catalog (manga detail or search) so the user can continue to read via Consumet-backed flows.

#### Scenario: Open series
- **WHEN** the user activates a Browse card
- **THEN** they navigate to an in-app manga or search destination for that title

### Requirement: Browse feed errors
If a Browse feed upstream fails, the page MUST show an error or empty state for that feed without crashing the shell.

#### Scenario: Upstream failure
- **WHEN** the Browse BFF cannot load a selected feed
- **THEN** the user sees a recoverable error or empty state for that section
