## Purpose

Align MangaTrack developer experience with other Wayool products through automated formatting, pre-commit checks, and Vitest unit tests in CI.

## ADDED Requirements

### Requirement: Pre-commit quality gate

The repository MUST run ESLint fix and Prettier on staged TypeScript/TSX files before each commit via Husky and lint-staged.

#### Scenario: Commit formats staged files

- **WHEN** a developer commits staged `.ts` or `.tsx` files
- **THEN** lint-staged runs ESLint with fix and Prettier write on those files before the commit completes

### Requirement: Vitest as unit test runner

The project MUST use Vitest (not Jest) for unit tests under `tests/**/*.test.ts` and MUST expose `npm test` as `vitest run`.

#### Scenario: Unit tests run in CI

- **WHEN** CI executes after a push or pull request
- **THEN** it runs `npm test` and fails if any unit test fails

#### Scenario: Playwright unchanged

- **WHEN** the Vitest migration is complete
- **THEN** Playwright e2e scripts and configs remain available and separate from Vitest
