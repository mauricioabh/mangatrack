## Context

`/search` debounces the query and auto-fetches on every filter change via multi-provider Consumet. The API defaults `limit=20`, soft-slices the merge, and reports `pagination.total` as the current batch size—not a catalog total. `hasNextPage` from providers is dropped in multi-search. The reader cold-path shows an animated book plus rotating status text lines.

## Goals / Non-Goals

**Goals:**

- Explicit search submit only (button / Enter / initial `?q=`).
- AbortController + generation guard against stale responses.
- Lock chrome and results during primary search; book-only loading animation.
- Infinite scroll via `page` + `hasMore`; sentinel UI; no fake totals.
- Append dedupe by `provider:id` only.
- Reader cold-path: keep book animation, remove status text.

**Non-Goals:**

- Global result counts across Consumet.
- Cross-provider title collapse.
- Changing relevance scoring or allowlist.

## Decisions

### 1. Explicit submit (not search-as-you-type)

**Choice:** Remove debounced auto-search effect. Filters change local state only until Search/Enter. `?q=` on mount runs one search.

**Alternatives:** Keep debounce — rejected (too many Consumet fan-outs). Hybrid auto-filter — rejected for simplicity.

### 2. Abort + generation

**Choice:** One `AbortController` for the active primary (and load-more) fetch; bump a generation id on each new primary search; ignore aborted/stale JSON.

**Alternatives:** Only disable UI — rejected; network races still apply results.

### 3. Multi-provider pagination model

**Choice:** Pass `page` to each provider; merge + rank that page’s batch; return `hasMore = any(provider.hasNextPage)`. Client appends page 2+ with `provider:id` dedupe. Soft `limit` slice remains for page size to the UI.

**Alternatives:** Cursor-per-provider — more correct continuity, higher complexity. Deferred.

**Note:** Page N is “next page from each source,” not a global ranked offset. Acceptable trade-off.

### 4. Result heading without total

**Choice:** `Search Results for "…"` / empty idle state; no `(N)` total. Sentinel shows loading-more / end-of-results.

### 5. Loading UI — book only, no copy

**Choice:** Extract a small reusable `BookLoadingMark` (or similar) used by search primary wait and reader cold stages. No status strings. Search may show book over locked grid / skeletons; reader keeps skeleton → cold book → cold skeleton timing without text lines.

### 6. Clear filters

**Choice:** Clear resets query + filters and clears results (or idle empty); does not auto-hit Consumet until user searches again (except if product wants empty browse — today empty query returns `[]`, so stay empty).

## Risks / Trade-offs

- [Risk] Append order across pages is not a single global ranking → Mitigation: document as provider-page pagination; keep per-batch relevance.
- [Risk] Provider page sizes differ → Mitigation: `limit` soft-slice + hasMore OR of providers.
- [Risk] User expects filter change to refresh → Mitigation: Filters sheet still visible; Search remains primary CTA; optional future “Apply”.
- [Risk] Abort leaves empty UI on rapid re-submit → Mitigation: keep previous results under overlay until new success, or clear only on successful replace—prefer overlay on previous until replace.

## Migration Plan

Ship behind normal deploy. No schema/env. Rollback: revert UI to debounce (not desired). Update `docs/MANGA_SOURCE.md` search note.

## Open Questions

None blocking — product choices confirmed in explore (explicit submit, no totals, book without text, keep multi-provider rows).
