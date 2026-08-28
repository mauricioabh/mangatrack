# i18n-locale Specification

## Purpose
Offer a bilingual user interface (English and Spanish) with shareable localized URLs and persistent locale preference.
## Requirements
### Requirement: Supported locales

The application MUST support English (`en`) as default and Spanish (`es`).

#### Scenario: Default English without prefix

- **WHEN** a user opens `/dashboard` without a locale prefix
- **THEN** the UI renders in English

#### Scenario: Spanish prefixed routes

- **WHEN** a user opens `/es/dashboard`
- **THEN** the UI renders in Spanish for app chrome and translated screens

### Requirement: Locale middleware with auth

Locale detection and routing MUST compose with Clerk authentication middleware so protected routes remain protected in both locales.

#### Scenario: Protected route in Spanish

- **WHEN** a signed-out user opens `/es/dashboard`
- **THEN** they are redirected to sign-in (Spanish or default sign-in path per routing config)

### Requirement: Language switcher persists preference

The app MUST provide a language control (settings and/or header) that switches locale and persists the choice (cookie) across sessions.

#### Scenario: Switch to Spanish

- **WHEN** a signed-in user selects Spanish from the language control
- **THEN** the app navigates to the equivalent Spanish route
- **AND** subsequent visits prefer Spanish until changed

### Requirement: Localized auth and core routes

Sign-in, sign-up, dashboard, search, browse, settings, manga detail, and reader shell MUST have translated UI strings in both locales.

#### Scenario: Settings in Spanish

- **WHEN** a user opens `/es/settings`
- **THEN** settings section labels and actions appear in Spanish

#### Scenario: Catalog metadata unchanged

- **WHEN** manga titles come from Consumet
- **THEN** catalog title text MAY remain in source language; only app UI chrome is translated

