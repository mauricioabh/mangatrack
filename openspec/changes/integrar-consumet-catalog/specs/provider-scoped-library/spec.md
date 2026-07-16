## ADDED Requirements

### Requirement: Provider-scoped favorites
User favorites SHALL be stored with both `provider` and `externalMangaId`. Uniqueness MUST be `(userId, provider, externalMangaId)`.

#### Scenario: Favorite from search
- **WHEN** an authenticated user favorites a manga listing
- **THEN** Neon stores the selected `provider` and that listing’s external manga id

#### Scenario: Same external string different providers
- **WHEN** two providers coincidentally share the same id string for different listings
- **THEN** both may be favorited as separate rows distinguished by `provider`

### Requirement: Provider-scoped reading history
Reading history SHALL store `provider`, `externalMangaId`, and `externalChapterId` with uniqueness on `(userId, provider, externalChapterId)` (or equivalent that includes provider).

#### Scenario: Mark chapter read
- **WHEN** the user completes or records a chapter from provider P
- **THEN** history is keyed to P and that chapter’s external id and does not satisfy uniqueness for another provider’s chapter with the same raw id string

### Requirement: Wipe legacy MangaDex-only library rows
On schema cutover the system SHALL clear existing favorites, reading history, and manga-linked notification rows that used UUID-only MangaDex fields, rather than migrating them as ambiguous IDs.

#### Scenario: Post-wipe library
- **WHEN** the wipe/migration has been applied
- **THEN** users start with an empty provider-scoped library for catalog entities and new favorites use the new columns only

### Requirement: Library hydration via Consumet
Dashboard and bookmark listings SHALL resolve titles/covers by calling Consumet (via BFF/catalog layer) using each row’s `provider` + `externalMangaId`, not by assuming MangaDex UUIDs or batch MangaDex `ids[]`.

#### Scenario: Favorites list
- **WHEN** the user opens their library with N favorites across providers
- **THEN** each item is hydrated with metadata from the correct provider (degraded item allowed if that provider fails)

### Requirement: Notifications carry provider scope
In-app notifications that reference manga or chapters SHALL store provider-scoped identifiers consistent with favorites/history.

#### Scenario: New chapter notification payload
- **WHEN** a `NEW_CHAPTER` notification is created
- **THEN** it includes enough provider + external ids to open the correct detail/reader listing
