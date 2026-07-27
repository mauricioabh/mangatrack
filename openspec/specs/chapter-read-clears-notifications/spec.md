# chapter-read-clears-notifications Specification

## Purpose
Keep in-app NEW_CHAPTER notifications aligned with reading history.

## Requirements

### Requirement: Mark related NEW_CHAPTER notifications read when chapter is read
When the authenticated user records a chapter as read in reading history, the system MUST mark as read any of that user’s unread `NEW_CHAPTER` notifications that match the same provider and external chapter id (and manga id when present on the notification).

#### Scenario: Matching notification dismissed
- **WHEN** the user marks chapter C of manga M as read and an unread NEW_CHAPTER notification exists for that provider/chapter
- **THEN** that notification’s `read` field becomes true

#### Scenario: Unrelated notifications untouched
- **WHEN** the user marks chapter C as read
- **THEN** notifications for other chapters or types MUST remain unchanged
