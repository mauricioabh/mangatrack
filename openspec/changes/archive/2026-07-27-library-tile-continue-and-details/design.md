## Context

Library tiles in `DashboardContent` wrap the entire card in a `Link` to `mangaPath(provider, mangaId)`. Resume/continue lives only on the manga detail CTA, which (via WAY-88 / `continue-reading`) targets the chapter with the latest `readAt`. The bookmarks API already loads Consumet chapters and reading history per favorite for progress enrichment, but strips `chapters: []` and does not expose a continue chapter id to the client.

## Goals / Non-Goals

**Goals:**

- Primary tile click opens the reader at the continue/start/re-read chapter (same rules as detail Continue Reading).
- Explicit **Details** control opens the manga detail page.
- Valid markup: no nested `<a>` elements; Details usable on touch targets.
- Compute continue target server-side during bookmarks hydration.

**Non-Goals:**

- Changing progress-bar math, badges, or library filters.
- Shipping full chapter lists to the Library client.
- In-chapter page progress.

## Decisions

1. **Reuse `getChapterToContinue` + last-read id from history**  
   Bookmarks hydration already has chapters and can take the most recent history row per series (`readAt` desc). Pass that id into `getChapterToContinue`. Do not invent a second resume algorithm. Alternatives: client-side fetch of manga info on click (extra latency / Consumet load); navigate to detail only (status quo).

2. **API field: `continueChapterId` (nullable string)**  
   Optionally include `continueChapterNumber` for future labels; not required for v1 navigation. When null (no chapters / degraded), primary tile href falls back to `mangaPath`. Alternatives: return full chapters array (payload bloat); compute only on client (can't without chapters).

3. **Tile structure: card shell + two siblings links**  
   Outer non-link container; primary `Link` covers cover/title/progress → `readerPath(provider, continueChapterId, mangaId)` (or details if null); separate `Link`/`Button asChild` for Details → `mangaPath`. Alternatives: single link + `stopPropagation` on button (works but easier to regress nested anchors).

4. **Same-tab navigation**  
   Follow existing `same-tab-reader` behavior (no `target="_blank"`).

## Risks / Trade-offs

- [WAY-88 helpers not merged yet] → Implement against current `getChapterToContinue` on this branch; coordinate merge order with WAY-88.
- [Orphan last-read id] → Same fallback as detail CTA (first chapter when progress exists).
- [Details hit-target too small on mobile] → Use a clear text button (e.g. bottom of tile or overlay chip) with adequate padding.

## Migration Plan

- Code-only deploy. No schema migration. Rollback = revert commit.

## Open Questions

- None for implementation (Details label: English "Details" to match existing Library English UI).
