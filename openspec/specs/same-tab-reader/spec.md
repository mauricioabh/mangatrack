# same-tab-reader Specification

## Purpose
Ensure chapter reading from manga detail stays in the same browser tab for PWA-friendly navigation.

## Requirements

### Requirement: Same-tab chapter navigation from manga detail
From the manga detail page, Start/Continue Reading and chapter list links MUST open the reader in the same browser tab (no `window.open` with `_blank` and no `target="_blank"` on chapter links).

#### Scenario: Start reading
- **WHEN** the user activates Start or Continue Reading on manga detail
- **THEN** the app navigates to the reader path in the current tab

#### Scenario: Chapter list item
- **WHEN** the user activates a chapter row on manga detail
- **THEN** the app navigates to that chapter’s reader path in the current tab

#### Scenario: Modifier-click still allowed
- **WHEN** the user uses a normal same-document link (e.g. Next.js `Link`) without `target="_blank"`
- **THEN** the browser’s native Ctrl/Cmd/middle-click behavior MAY open a new tab; the default click MUST stay same-tab
