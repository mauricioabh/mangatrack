# library-progress-ux Specification

## Purpose
TBD - created by archiving change library-browse-mangadex-comick. Update Purpose after archive.
## Requirements
### Requirement: Library surface naming
The authenticated library view MUST present the heading **Library** (not Bookmarks) for the user’s favorited series.

#### Scenario: Dashboard heading
- **WHEN** a signed-in user opens `/dashboard`
- **THEN** the primary heading reads Library and shows the favorite count

### Requirement: Reading badge on library tiles
The system MUST show a **Reading** badge on a library tile when the user has at least one `reading_history` row for that favorite’s `(provider, externalMangaId)`.

#### Scenario: Started series
- **WHEN** the user has reading history for a favorited manga
- **THEN** the library tile displays a Reading badge

#### Scenario: Never opened
- **WHEN** the user has no reading history for a favorited manga
- **THEN** the library tile MUST NOT show a Reading badge

### Requirement: Progress bar on library tiles
When total chapter count is known, the library tile MUST show a progress indicator reflecting reading progress for that series (derived from history vs total chapters). Progress MUST NOT require a new Prisma field.

#### Scenario: Partial progress
- **WHEN** the user has read some chapters and Consumet info exposes a positive total chapter count
- **THEN** the tile shows a progress bar between 0 and 100% consistent with derived progress

#### Scenario: Unknown total
- **WHEN** total chapter count is unavailable
- **THEN** the tile MAY omit the progress bar without failing the library render

