# reader-immersive-chrome Specification

## Purpose
Immersive manga reader chrome: hideable header, consolidated settings, and software brightness for web/PWA reading.

## Requirements

### Requirement: Reader has no fixed footer chrome
The manga reader SHALL NOT render a fixed bottom footer. Chapter navigation that previously lived in the footer MUST be available from the header settings control when chrome is visible.

#### Scenario: Footer absent
- **WHEN** the user opens a chapter in the reader
- **THEN** no fixed footer bar is shown at the bottom of the viewport

### Requirement: Tap toggles reader header chrome
The reader SHALL allow the user to show or hide the header by tapping or clicking the reading area. Chrome MUST start visible when a chapter loads. Toggles MUST NOT fire when the user interacts with the header, settings panel, or modal dialogs. A scroll/drag gesture MUST NOT toggle chrome.

#### Scenario: Hide chrome on tap
- **WHEN** chrome is visible and the user taps the reading area (not on interactive chrome)
- **THEN** the header hides and page content uses the freed vertical space

#### Scenario: Show chrome on tap
- **WHEN** chrome is hidden and the user taps the reading area
- **THEN** the header becomes visible again

#### Scenario: Scroll does not toggle
- **WHEN** the user scrolls vertically through pages
- **THEN** chrome visibility does not change solely due to the scroll gesture

### Requirement: Settings icon consolidates reader controls
The reader header SHALL show a settings control on the right side that opens a panel containing: previous chapter, next chapter, reading orientation (vertical/horizontal), image fit, and brightness. The Back-to-manga control SHALL remain on the left. Those chapter/orientation/fit controls MUST NOT remain as always-visible buttons in the header row.

#### Scenario: Open settings panel
- **WHEN** chrome is visible and the user activates the settings icon
- **THEN** a panel lists chapter prev/next, orientation, fit, and brightness controls

#### Scenario: Back stays left
- **WHEN** chrome is visible
- **THEN** a Back control linking to the manga detail page remains on the left side of the header

### Requirement: Software brightness slider
The reader SHALL provide a brightness control that dims page content via a software overlay or equivalent CSS effect (not OS screen brightness). The effective brightness MUST be clamped so content remains readable (minimum above fully black). The chosen value MUST persist in `localStorage` and restore on later reader visits on the same device/browser.

#### Scenario: Dim pages
- **WHEN** the user lowers the brightness slider
- **THEN** page images appear darker while header chrome remains fully readable

#### Scenario: Persist brightness
- **WHEN** the user sets a brightness value and later reopens the reader
- **THEN** the previously chosen brightness is applied

### Requirement: Horizontal page chrome follows visibility
In horizontal reading mode, page navigation arrows and the page counter SHALL only appear when header chrome is visible.

#### Scenario: Hide page arrows with chrome
- **WHEN** reading mode is horizontal and the user hides chrome
- **THEN** page prev/next overlay arrows are not shown

#### Scenario: Page counter with chrome
- **WHEN** reading mode is horizontal and chrome is visible
- **THEN** the current page position (e.g. `3 / 42`) is visible in the header or settings panel
