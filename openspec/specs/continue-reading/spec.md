# continue-reading Specification

## Purpose
Manga detail Continue Reading CTA resumes the user’s last reading session chapter.

## Requirements

### Requirement: Continue Reading resumes last session chapter
On the manga detail page, when the signed-in user has at least one reading-history row for the series and not every listed chapter is marked read, the primary reading CTA MUST navigate to the chapter whose history row has the most recent `readAt`, and the label MUST include that chapter’s number (e.g. `Continue Reading — Ch. 100`).

#### Scenario: Mid-series only latest chapter in history
- **WHEN** the user has reading history only for chapter 100 (chapters 1–99 unread)
- **THEN** the CTA label includes Ch. 100 and navigating the CTA opens chapter 100

#### Scenario: Advanced to next after finishing previous
- **WHEN** the user has history for chapter 100 and a more recent `readAt` for chapter 101
- **THEN** the CTA targets chapter 101

### Requirement: Start Reading when no history
When the user has no reading history for the series, the CTA MUST show Start Reading and open the first chapter in ascending chapter order.

#### Scenario: Never started
- **WHEN** `reading_history` is empty for the manga
- **THEN** the CTA shows Start Reading and opens the first chapter

### Requirement: Re-read when all chapters read
When every chapter in the current list is marked read, the CTA MUST show Re-read from start and open the first chapter (not the last-read chapter).

#### Scenario: Series fully read
- **WHEN** every listed chapter id is present in the user’s reading history for that manga
- **THEN** the CTA shows Re-read from start and opens the first chapter
