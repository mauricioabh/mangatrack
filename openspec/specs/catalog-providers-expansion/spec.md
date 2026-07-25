# catalog-providers-expansion Specification

## Purpose
TBD - created by archiving change library-browse-mangadex-comick. Update Purpose after archive.
## Requirements
### Requirement: Default provider allowlist includes MangaDex and ComicK
The default Consumet provider allowlist MUST include `mangahere`, `mangapill`, `mangadex`, and `comick`. The default MUST NOT include `weebcentral`.

#### Scenario: Default allowlist
- **WHEN** `CONSUMET_PROVIDER_ALLOWLIST` is unset
- **THEN** multi-provider search uses mangahere, mangapill, mangadex, and comick only

#### Scenario: Env override
- **WHEN** `CONSUMET_PROVIDER_ALLOWLIST` is set to a CSV subset
- **THEN** search only queries the intersection of requested providers and that allowlist

### Requirement: Search UI lists expanded providers
The search provider filter MUST include the allowlisted providers (including mangadex and comick) so users can enable/disable them.

#### Scenario: Filter options
- **WHEN** a signed-in user opens search provider filters
- **THEN** mangadex and comick appear as selectable providers when present in the allowlist

### Requirement: Referers and covers for new providers
Cover and page image fetching MUST apply provider-appropriate Referer (or proxy) behavior for mangadex and comick so CDN hotlink failures are minimized.

#### Scenario: ComicK or MangaDex cover
- **WHEN** the app loads a cover for mangadex or comick
- **THEN** it uses the catalog cover proxy/referer path configured for that provider rather than a bare browser fetch that omits required headers

### Requirement: Documentation and env template
`.env.example` and `docs/MANGA_SOURCE.md` / `docs/ENV.md` MUST document the expanded allowlist and note that `weebcentral` is excluded until Consumet returns healthy search responses.

#### Scenario: Docs mention exclusion
- **WHEN** a developer reads ENV or MANGA_SOURCE docs after this change
- **THEN** they see mangadex and comick as supported and weebcentral called out as not enabled

