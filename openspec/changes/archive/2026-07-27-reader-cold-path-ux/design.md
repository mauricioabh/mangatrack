## Context

After `reader-loading-performance` (in-process page-list TTL + skeleton gate), cold opens still waited on `getMangaInfo` + `getChapterPages` together, and a static skeleton for 10–30s felt broken. PRs #47/#48 implemented the fix on `main`; this change captures the design and specs for OpenSpec/Linear process.

## Goals / Non-Goals

**Goals:**

- First scans do not wait on manga catalog/info
- Warm/cache: skeleton → scans only
- Cold: escalate UI (animated book → skeletons + status) only after wait thresholds
- Prefetch page list when user intends to open a chapter

**Non-Goals:**

- Shared Redis cache
- Exact server `X-Cache` driven UI (time proxy is enough for v1)

## Decisions

### 1. Split API with `fields=pages` | `fields=meta`

- **Why:** Manga info often dominates latency; pages alone unlock images.
- **Alt:** Streaming single response — heavier; skip for now.

### 2. Time-based loading stages (not fixed always-on book)

- **Why:** Client cannot know HIT/MISS until response; elapsed time proxies cold.
- **Stages:** `skeleton` (0) → `cold-book` (~1.6s) → `cold-skeleton` (~3.4s); cancel on pages ready.

### 3. `warmChapterPages` on pointerdown / continue

- **Why:** Overlap Consumet scrape with navigation; warm in-process cache + first image decode.

## Risks / Trade-offs

- [Slow warm >1.6s shows book] → Acceptable; thresholds tunable
- [Prefetch wasted on mis-tap] → Cheap GET; OK

## Migration Plan

- Already on `main` via #47/#48; this change is process formalization + spec sync

## Open Questions

- None for archive; optional later: return `fromCache` on pages JSON to suppress book even on slow HIT
