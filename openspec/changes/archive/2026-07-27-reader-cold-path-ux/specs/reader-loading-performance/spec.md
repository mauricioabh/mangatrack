## MODIFIED Requirements

### Requirement: Reader shows page skeletons while loading
The reader SHALL show page-shaped loading placeholders (skeletons) and a minimal reader chrome as soon as the reader route mounts, without waiting for the chapter **page list** to finish loading. Manga info / chapter catalog MAY load in parallel and MUST NOT gate the initial skeleton.

#### Scenario: Immediate feedback on open
- **WHEN** the user navigates to a chapter reader route
- **THEN** the UI displays page-shaped skeletons (or equivalent placeholders) before the page list returns

#### Scenario: Content replaces skeletons after load
- **WHEN** the page list returns successfully with page proxy URLs
- **THEN** the reader renders the chapter pages using those URLs and continues to allow lazy loading for pages after the first

### Requirement: Chapter load failures remain recoverable
The reader SHALL still surface a clear error state with retry when the chapter **page list** fails to load.

#### Scenario: Failed chapter fetch
- **WHEN** the pages API returns an error or the client cannot load the page list
- **THEN** the reader shows an error message and a retry action (skeletons alone MUST NOT be the only outcome)
