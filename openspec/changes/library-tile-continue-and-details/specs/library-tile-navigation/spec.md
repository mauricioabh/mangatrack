## ADDED Requirements

### Requirement: Library tile primary click opens continue chapter
On the Library grid, when a favorite tile has a resolvable continue chapter, activating the primary tile area (cover, title, progress — anything except Details) MUST navigate to the reader for that chapter in the same tab. The continue chapter MUST be the same target that Continue Reading would use for that series: chapter with the most recent `readAt` when history exists and not all chapters are read; first chapter when there is no history (Start Reading); first chapter when every listed chapter is read (Re-read from start).

#### Scenario: Mid-series resume from tile
- **WHEN** the user has reading history whose latest `readAt` is chapter 100 and not every chapter is marked read
- **THEN** clicking the primary tile area opens the reader for chapter 100

#### Scenario: Never started
- **WHEN** the user has no reading history for the favorite and chapters are available
- **THEN** clicking the primary tile area opens the first chapter in ascending order

#### Scenario: Fully read series
- **WHEN** every listed chapter id is present in reading history for that favorite
- **THEN** clicking the primary tile area opens the first chapter (re-read)

#### Scenario: No resolvable chapter
- **WHEN** the continue chapter cannot be resolved (empty or failed chapter list)
- **THEN** clicking the primary tile area opens the manga detail page instead of the reader

### Requirement: Details control opens manga detail page
Each library tile MUST expose a **Details** control. Activating Details MUST navigate to the manga detail page for that favorite’s provider and manga id, and MUST NOT open the reader.

#### Scenario: Details from tile
- **WHEN** the user activates Details on a library tile
- **THEN** the app navigates to the manga detail page for that series

#### Scenario: Details does not start reader
- **WHEN** the user activates Details
- **THEN** the reader MUST NOT open as a result of that activation

### Requirement: Tile interactions are valid and separable
The Library tile MUST implement primary navigation and Details as separate interactive targets without nesting one anchor inside another.

#### Scenario: Independent targets
- **WHEN** the library grid renders tiles with a continue chapter id
- **THEN** the primary area and Details are distinct controls and the markup does not nest links
