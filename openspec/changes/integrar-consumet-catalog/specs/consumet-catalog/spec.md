## ADDED Requirements

### Requirement: Server-side Consumet client
The system SHALL call the self-hosted Consumet API only from server-side code (route handlers, server components, or background jobs), using `CONSUMET_BASE_URL` from environment configuration. The base URL MUST NOT be hardcoded.

#### Scenario: Configured base URL
- **WHEN** a catalog request is made and `CONSUMET_BASE_URL` is set
- **THEN** the client sends HTTP requests to that origin under `/manga/{provider}/...`

#### Scenario: Missing base URL
- **WHEN** a catalog request is made and `CONSUMET_BASE_URL` is unset
- **THEN** the system fails closed with a clear configuration error (no silent fallback to `api.consumet.org` or `api.mangadex.org`)

### Requirement: Provider-aware search, info, and read
The Consumet catalog client SHALL expose typed operations for manga search, manga info (including chapters), and chapter page reads, each taking an explicit `provider` identifier.

#### Scenario: Search
- **WHEN** `searchManga(provider, query, page?)` is invoked
- **THEN** the client requests `GET /manga/{provider}/{urlEncodedQuery}` and returns normalized results including `id`, `title`, `coverUrl` (if present), and `provider`

#### Scenario: Info with chapters
- **WHEN** `getMangaInfo(provider, id)` is invoked
- **THEN** the client requests Consumet info for that provider/id and returns normalized detail including a `chapters` array with chapter `id`, number, and title when available

#### Scenario: Read pages
- **WHEN** `getChapterPages(provider, chapterId)` is invoked
- **THEN** the client requests Consumet read for that chapter and returns ordered `Page` entries with `url` and `index`

### Requirement: Error and timeout handling
The client SHALL apply a configurable timeout (default in the 30–60s range), treat Consumet JSON bodies containing `message`/`error` as failures, and surface retryable errors to callers without throwing opaque stack traces to the UI layer.

#### Scenario: Provider error payload
- **WHEN** Consumet responds with a JSON error object instead of results
- **THEN** the client returns a typed failure the BFF can map to an HTTP error and user-facing retry message

#### Scenario: Slow provider
- **WHEN** a Consumet call exceeds the configured timeout
- **THEN** the client aborts the request and reports a timeout failure

### Requirement: Catalog cover proxy
Catalog cover images from scrape CDNs MUST be loaded through a server-side BFF proxy that supplies the required Referer (and related headers). The browser MUST NOT be expected to hotlink third-party cover CDNs successfully.

#### Scenario: Search result cover
- **WHEN** a search hit includes a cover URL on a hotlink-protected CDN
- **THEN** the UI requests `/api/catalog/cover` (or equivalent) and renders the proxied image bytes

#### Scenario: Upstream cover unavailable
- **WHEN** the upstream CDN returns 403/404/empty for a cover
- **THEN** the UI shows a non-crashing placeholder instead of a broken image icon

### Requirement: Title fallback on incomplete info
When manga info omits or nulls `title`, the system SHALL fall back to an alternate title from Consumet `altTitles` or a previously known search title rather than displaying an empty title.

#### Scenario: Null title on info
- **WHEN** info returns `title` null but `altTitles` contains a usable string
- **THEN** the normalized `MangaDetail.title` is that fallback string

### Requirement: No direct MangaDex catalog API
After cutover, catalog search, detail, and reader data MUST be obtained via Consumet. The application MUST NOT call `https://api.mangadex.org` for those flows.

#### Scenario: Reader load
- **WHEN** the user opens a chapter reader for a favorited or searched manga
- **THEN** page URLs are resolved through Consumet read (via BFF), not MangaDex at-home APIs
