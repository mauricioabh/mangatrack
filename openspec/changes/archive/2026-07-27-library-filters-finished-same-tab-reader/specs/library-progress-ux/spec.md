## ADDED Requirements

### Requirement: Finished indicator on library tiles
When a library favorite is Finished, the Library tile MAY show a Finished badge or equivalent affordance so filtered and unfiltered views remain scannable.

#### Scenario: Finished favorite visible
- **WHEN** a favorite has finished state set and appears in the library grid
- **THEN** the tile indicates Finished without removing Reading/New indicators that still apply

## MODIFIED Requirements

### Requirement: Library surface naming
The authenticated library view MUST present the heading **Library** (not Bookmarks) for the user’s favorited series. The heading area MUST include the total favorite count badge; when filters are active it MUST also surface the filtered “Showing X of Y” affordance defined by `library-filters`.

#### Scenario: Dashboard heading
- **WHEN** a signed-in user opens `/dashboard`
- **THEN** the primary heading reads Library and shows the favorite count

#### Scenario: Heading with active filters
- **WHEN** New and/or Finished filters are active
- **THEN** Library heading still shows total count Y and the showing X of Y line
