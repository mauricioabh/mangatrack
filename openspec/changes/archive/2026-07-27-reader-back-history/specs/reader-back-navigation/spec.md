## ADDED Requirements

### Requirement: Reader Back uses history with Detail fallback
The manga reader in-app Back control (header Back) MUST navigate to the previous same-origin history entry when available. When previous history cannot be used safely (no prior entry, or previous navigation was cross-origin), Back MUST navigate to the manga Detail page for the current series in the same tab. Back MUST NOT push the manga Detail page when a safe previous history entry exists.

#### Scenario: Back from Library continue
- **WHEN** the user opened the reader from Library (primary tile continue) and activates header Back
- **THEN** the app returns to Library (or the previous same-origin page) without opening manga Detail as an intermediate push

#### Scenario: Back from Detail continue
- **WHEN** the user opened the reader from manga Detail and activates header Back
- **THEN** the app returns to that manga Detail page

#### Scenario: Deep link fallback
- **WHEN** the user opened the reader without a usable same-origin previous history entry and activates header Back
- **THEN** the app navigates to the manga Detail page for the current series in the same tab

#### Scenario: No Reader–Detail ping-pong
- **WHEN** the user activates header Back on the reader and then activates Back on manga Detail
- **THEN** the app MUST NOT return the user to the same reader chapter as an infinite loop caused by Back pushing Detail

### Requirement: Chapter prev/next replaces history
Navigating to the previous or next chapter from within the reader MUST replace the current history entry with the target chapter’s reader URL (same tab). It MUST NOT push a new history entry for each chapter hop.

#### Scenario: Back after chapter hop
- **WHEN** the user opens the reader from Library, navigates to the next chapter via in-reader controls, then activates header Back
- **THEN** the app returns to Library (or the original previous page), not to the previous chapter URL

#### Scenario: Same-tab chapter change
- **WHEN** the user activates prev or next chapter in the reader
- **THEN** the chapter loads in the current tab at the target reader path
