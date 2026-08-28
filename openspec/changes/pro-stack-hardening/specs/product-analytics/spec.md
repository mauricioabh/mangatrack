## Purpose

Track product usage in the shared Wayool PostHog project while distinguishing MangaTrack events from other apps via a mandatory app tag.

## ADDED Requirements

### Requirement: App tag on all events

Every PostHog event captured from MangaTrack MUST include the super property `app` with value `man`.

#### Scenario: Pageview tagged

- **WHEN** a user navigates to any in-app route and PostHog is configured
- **THEN** the captured pageview event includes `app: man`

#### Scenario: Custom event tagged

- **WHEN** the app captures a product event (e.g. bookmark added)
- **THEN** the event includes `app: man` without requiring manual per-call tagging

### Requirement: Identify signed-in users

When a user is authenticated via Clerk, PostHog MUST identify them by Clerk user id. On sign-out, the analytics client MUST reset identity.

#### Scenario: Sign in identifies

- **WHEN** a user completes sign-in
- **THEN** PostHog identifies the session with the Clerk user id

#### Scenario: Sign out resets

- **WHEN** a user signs out
- **THEN** PostHog clears the identified user for subsequent anonymous events

### Requirement: No-op without PostHog key

When `NEXT_PUBLIC_POSTHOG_KEY` is absent, analytics MUST not throw or block rendering.

#### Scenario: Local without PostHog

- **WHEN** the app runs locally without PostHog env vars
- **THEN** pages render and core flows work without analytics errors

### Requirement: Privacy on search events

Search analytics MUST NOT include the raw search query string in event properties.

#### Scenario: Search event buckets query length

- **WHEN** a search is performed and analytics fires
- **THEN** properties MAY include query length or provider count but NOT the literal query text
