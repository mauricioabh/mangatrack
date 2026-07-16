## ADDED Requirements

### Requirement: Daily chapter poll job
The system SHALL run a scheduled job at least once per day that checks favorited mangas for newly available chapters using Consumet manga info (not a MangaDex webhook).

#### Scenario: Cron runs with favorites present
- **WHEN** the daily job executes and at least one favorite exists
- **THEN** the job fetches Consumet info for those `(provider, externalMangaId)` pairs (with concurrency limits) and evaluates chapter novelty

#### Scenario: New chapter detected
- **WHEN** info shows a chapter newer than the stored watermark / last notified chapter for that favorite
- **THEN** the system creates a `NEW_CHAPTER` notification (and triggers existing email/push paths when the user has them enabled)

### Requirement: Watermark per favorite
The system SHALL persist a per-favorite watermark (e.g. last notified or last seen chapter external id / number) so the same chapter is not notified repeatedly.

#### Scenario: Idempotent poll
- **WHEN** the daily job runs again and the chapter list is unchanged
- **THEN** no duplicate `NEW_CHAPTER` notification is created for the same chapter

### Requirement: Remove MangaDex webhook dependency
After cutover, new-chapter detection MUST NOT require `/api/webhook/mangadex` or MangaDex push events.

#### Scenario: Webhook disabled or removed
- **WHEN** the MangaDex webhook endpoint is removed or returns gone/disabled
- **THEN** chapter notifications continue to be produced by the daily poll job alone

### Requirement: Poll resilience
The poll job SHALL continue processing remaining favorites if individual Consumet calls fail, and SHALL log/skip failures without aborting the entire run.

#### Scenario: One provider outage mid-run
- **WHEN** info fails for one favorite
- **THEN** other favorites are still processed in the same run
