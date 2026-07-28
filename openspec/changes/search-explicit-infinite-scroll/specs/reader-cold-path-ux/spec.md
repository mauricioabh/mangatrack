## MODIFIED Requirements

### Requirement: Loading entertainment only on prolonged waits

While chapter pages are loading, the reader SHALL show page skeletons immediately. The reader SHALL escalate to an animated book (or equivalent entertainment) only if pages are still loading after a short delay, and SHALL NOT show that entertainment when pages resolve before the delay (warm/cache path). When the animated book is shown, the reader SHALL NOT display status messaging text or instructional sentences alongside the book—animation only.

#### Scenario: Warm or cached load

- **WHEN** chapter pages become available before the cold-entertainment delay
- **THEN** the reader transitions from skeletons (or directly) to scans without showing the animated book stage

#### Scenario: Cold prolonged wait

- **WHEN** chapter pages are still loading after the cold-entertainment delay
- **THEN** the reader shows an animated book without status text, and may return emphasis to page skeletons if the wait continues, until pages arrive or an error is shown
