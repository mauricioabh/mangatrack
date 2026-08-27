## Purpose

Defines how dense My Library manga tiles appear across phone, tablet portrait, and tablet landscape/desktop viewports so covers stay readable without oversized tiles on wide screens.

## ADDED Requirements

### Requirement: Responsive library tile column density
My Library SHALL render favorite manga tiles in a responsive CSS grid that uses two columns on narrow phone widths, three columns from the tablet-portrait breakpoint (`md`, min-width 768px), and five columns from the medium/large breakpoint (`lg`, min-width 1024px) and above.

#### Scenario: Phone portrait keeps two columns
- **WHEN** the viewport width is below 768px
- **THEN** the My Library favorites grid shows two columns of manga tiles

#### Scenario: Tablet portrait uses three columns
- **WHEN** the viewport width is at least 768px and below 1024px
- **THEN** the My Library favorites grid shows three columns of manga tiles

#### Scenario: Tablet landscape and desktop use five columns
- **WHEN** the viewport width is at least 1024px
- **THEN** the My Library favorites grid shows five columns of manga tiles

### Requirement: Loading skeleton matches live grid density
While My Library bookmarks are loading, the skeleton placeholder grid SHALL use the same column breakpoints as the live favorites grid.

#### Scenario: Skeleton density matches favorites
- **WHEN** the dashboard library is in a loading state
- **THEN** the skeleton grid uses the same two / three / five column breakpoints as the populated favorites grid
