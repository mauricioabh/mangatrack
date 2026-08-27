## Context

See proposal.md — Why. My Library grids live only in `DashboardContent.tsx` (loading + populated). Today both use:

`grid-cols-2 gap-3 sm:gap-4 landscape:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`

Default Tailwind breakpoints apply (no custom screens in `globals.css`). Search/Browse use denser grids but are out of scope.

## Goals / Non-Goals

**Goals:**
- Implement 2 → 3 (`md`) → 5 (`lg`+) column density for Library grids.
- Keep phone portrait at two columns.
- Keep loading skeleton in sync with the live grid.

**Non-Goals:**
- Changing Search/Browse grids.
- Fluid `auto-fill` / `minmax` layouts.
- User preference for density.
- Changing tile content (badges, Details footer, aspect ratio).

## Decisions

1. **Width breakpoints over orientation**
   - Use `md:grid-cols-3` and `lg:grid-cols-5` only; drop `landscape:grid-cols-3` and the previous `lg:4` / `xl:5` steps.
   - Rationale: tablet landscape is typically ≥1024px (`lg`), so five columns apply there; tablet portrait (~768–1023) stays at three. Orientation-only rules fought that intent.
   - Alternative considered: keep `max-md:landscape:grid-cols-3` for phone landscape — deferred; phone landscape stays at two unless we hear it feels sparse.

2. **Stay at five columns through `xl` / `2xl`**
   - Do not add `xl:grid-cols-6` in this change.
   - Rationale: agreed target is five on medium/large; revisit if ultra-wide desktops feel empty.

3. **Single class string shared conceptually**
   - Apply the same class string to both grid divs in `DashboardContent.tsx` (no shared constant required unless duplication becomes painful).
   - Alternative: extract a constant — overkill for two identical strings.

## Risks / Trade-offs

- [Phone landscape stays at 2 cols] → Accept for now; add `max-md:landscape:grid-cols-3` in a follow-up if needed.
- [Five cols on large desktop may still feel large in a `container`] → Mitigate later with `xl:6` if user feedback says so.
- [CSS-only change, easy rollback] → Revert the two class strings if density feels wrong.

## Migration Plan

- Deploy as normal frontend change; no DB/env.
- Rollback: restore previous grid class strings.
