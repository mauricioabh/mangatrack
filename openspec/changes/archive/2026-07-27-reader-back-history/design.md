## Context

Library tiles navigate primary clicks to `readerPath` when a continue chapter exists. The reader header Back control is a `Link` to `mangaPath` (always pushes Detail). Manga Detail Back calls `window.history.back()`. That combination produces a Reader ↔ Detail history loop and buries Library under the Reader entry.

Chapter prev/next currently assigns `window.location.href`, which also pushes history and can deepen the trap.

## Goals / Non-Goals

**Goals:**

- In-app Back leaves the reader to the previous same-origin page when available.
- Fallback to manga Detail when history cannot be used safely.
- Chapter prev/next replaces the current history entry so Back skips intermediate chapters.
- Preserve same-tab navigation.

**Non-Goals:**

- Changing Library tile primary/Details hrefs.
- Adding a separate hierarchical “Series” control in v1.
- Changing Detail page Back behavior (keep `history.back()`).
- Reader chrome / immersive UI changes.

## Decisions

1. **Back = `router.back()` with Detail fallback**  
   Prefer true history semantics so Library → Reader → Back → Library and Detail → Reader → Back → Detail both work. Fallback: if there is no useful previous entry (e.g. cold open / deep link), `router.push(mangaPath)`. Heuristic: use `window.history.length > 1` plus same-origin `document.referrer` when present; when referrer is empty but length > 1 (common in SPA), still call `back()`; only push Detail when length ≤ 1 or referrer is clearly cross-origin.  
   Alternatives rejected: always `Link` to Detail (current bug); always `replace` to Detail (forces an extra hop from Library).

2. **Chapter change via `window.location.replace(readerPath(...))`**  
   Replace `window.location.href` (push) so prev/next does not stack chapter URLs. Full navigation keeps the existing chapter fetch path reliable; Back from any chapter in a session returns to the entry page (Library or Detail), not chapter N−1.  
   Alternatives: `router.push` (worse history); `router.replace` soft-nav (params Promise may not refetch reliably on this page).

3. **Shared small client helper (optional inline)**  
   Keep logic in the reader page or a tiny `navigateReaderBack` helper next to existing path helpers — avoid a new navigation framework. Prefer inline on the reader page unless reuse appears immediately.

4. **End-of-chapter / “Back to manga” CTAs**  
   Explicit “Back to Manga” / series links that are not the header Back MAY continue to use `mangaPath` (intentional up navigation). Only the header Back affordance must use history semantics.

## Risks / Trade-offs

- [SPA history.length unreliable] → Prefer `back()` when length > 1; Document that cold deep links fall back to Detail.
- [Cross-origin referrer] → Do not `back()` into external sites; push Detail instead.
- [Users who wanted “always series page”] → They can use Library Details or end-of-chapter series links; v1 prioritizes undo-entry path.
- [replace loses ability to back through chapters] → Intentional; chapter hops are mode changes within one reading session.

## Migration Plan

- Code-only deploy. Rollback = revert commit.

## Open Questions

- None — approach confirmed with product (history Back + chapter replace).
