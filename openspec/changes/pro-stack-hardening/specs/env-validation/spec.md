## Purpose

Ensure environment variables are validated at build and runtime so misconfigured deployments fail fast instead of breaking silently in production.

## ADDED Requirements

### Requirement: Typed environment schema

The application MUST define a single typed environment module that validates all server and client environment variables using a Zod schema before the app serves traffic or completes a production build.

#### Scenario: Build fails on missing required variable

- **WHEN** a production build runs without a required environment variable (e.g. `DATABASE_URL`)
- **THEN** the build fails with a clear validation error naming the missing variable

#### Scenario: Client variables exposed safely

- **WHEN** client code needs a public configuration value
- **THEN** it reads only from the validated client schema (prefix `NEXT_PUBLIC_`)

### Requirement: No skip validation in production build

The production build script MUST NOT set `SKIP_ENV_VALIDATION` or equivalent bypass flags.

#### Scenario: CI build validates env

- **WHEN** CI runs `npm run build` with placeholder credentials
- **THEN** the build succeeds because placeholders satisfy the schema
- **AND** no skip-validation flag is required

#### Scenario: Test runs may skip validation

- **WHEN** Vitest runs with a test env file or explicit test skip flag
- **THEN** unit tests MAY bypass full prod validation without affecting production builds
