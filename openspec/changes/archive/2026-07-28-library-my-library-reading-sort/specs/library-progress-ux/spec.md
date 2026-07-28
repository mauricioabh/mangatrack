## MODIFIED Requirements

### Requirement: Library surface naming
The authenticated library view MUST present the heading **My Library** (not Bookmarks or Library alone) for the user’s favorited series. The heading area MUST include the total favorite count badge; when filters are active it MUST also surface the filtered “Showing X of Y” affordance defined by `library-filters`.

#### Scenario: Heading copy
- **WHEN** a signed-in user opens the library dashboard
- **THEN** the primary heading reads My Library and shows the favorite count

#### Scenario: Filtered count under My Library
- **WHEN** filters or quick search reduce the visible list to X of Y favorites
- **THEN** My Library heading still shows total count Y and the showing X of Y line
