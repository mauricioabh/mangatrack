# notification-bell Specification

## Purpose

Header bell dropdown shows the user’s in-app notifications and lets them open the related chapter from the notification tile while clearing unread state.

## Requirements

### Requirement: Notification tile opens the chapter and marks read
When a notification includes provider and chapter identity, activating the notification tile (the primary clickable area for that row) MUST navigate to the chapter reader for that chapter and MUST mark the notification as read. The UI MUST NOT require a separate “go” / external-link control to open the chapter.

#### Scenario: New chapter notification activated
- **WHEN** the user activates a NEW_CHAPTER notification tile that has provider and chapter id
- **THEN** the app navigates to the reader for that chapter and the notification is marked read

#### Scenario: Notification without chapter target
- **WHEN** the user activates a notification that lacks a chapter target (e.g. SYSTEM without chapter id)
- **THEN** the system MUST still mark it read if activated for dismiss, and MUST NOT navigate to a chapter reader

### Requirement: No dead “view all” footer
The notification dropdown MUST NOT include a “View all notifications” action that navigates to the dashboard or to a non-existent notifications page.

#### Scenario: Dropdown footer
- **WHEN** the user opens the notification bell with one or more notifications listed
- **THEN** there is no “View all notifications” control in the dropdown footer
