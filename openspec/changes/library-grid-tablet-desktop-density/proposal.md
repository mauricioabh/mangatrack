## Why

My Library manga tiles look fine on small phones, but on tablet and desktop the grid is too sparse (about 3–4 columns), so covers feel oversized and users see too few titles per row. We need denser columns on wider viewports without changing the phone portrait layout.

## What Changes

- Update My Library (dashboard) responsive grid breakpoints so tiles shrink on tablet landscape and desktop.
- Target column counts: **2** on phone, **3** on tablet portrait (`md`), **5** on medium/large (`lg`+).
- Remove the orientation-only `landscape:grid-cols-3` rule that kept tablet landscape at three columns.
- No API, data model, or Search/Browse grid changes in this change.

## Capabilities

### New Capabilities

- `library-grid-density`: Responsive column density for My Library manga tiles across phone, tablet portrait, and tablet landscape/desktop.

### Modified Capabilities

- (none)

## Impact

- Code: `src/components/DashboardContent.tsx` (loading skeleton grid + favorites grid).
- UX only; no env, Prisma, or API changes.
- Non-goals: Search/Browse density alignment, fluid `auto-fill` grids, user-selectable density.
- Risks: On very wide desktops, five columns may still feel large; can bump to six later if needed. Phone landscape stays at two columns after removing `landscape:`.
