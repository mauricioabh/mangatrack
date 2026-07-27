---
linear_story_id: WAY-93
linear_story_identifier: WAY-93
linear_story_title: "[MAN] Reader: carga de scans más rápida y skeleton de espera"
linear_story_url: https://linear.app/wayool/issue/WAY-93/man-reader-carga-de-scans-mas-rapida-y-skeleton-de-espera
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

Opening a chapter shows only a pulsing book icon until Consumet metadata returns, then each scan image proxy re-scrapes the same page list. Readers wait too long with little feedback; both real latency and perceived wait need to improve.

## What Changes

- Cache chapter page URL lists (short TTL) so chapter JSON and `/pages/N` proxy share one Consumet scrape
- Show reader chrome + page-shaped skeletons immediately while metadata/images load (no timed cover cascade)
- Keep first page eager; remaining pages lazy as today
- Preserve error/retry when a chapter fails to load

## Capabilities

### New Capabilities

- `reader-loading-performance`: Faster chapter page resolution via shared cache, plus immediate skeleton/placeholder UX in the reader while metadata and first scans load

### Modified Capabilities

- (none — immersive chrome and back-navigation requirements stay as-is)

## Impact

- `src/lib/consumet/service.ts` (and related) — page-list caching for `getChapterPages`
- `src/app/api/chapters/.../pages/[page]/route.ts` — benefits from cache
- `src/app/reader/[provider]/[chapterId]/page.tsx` — skeleton UX instead of book-only gate
- No schema/env changes expected; no **BREAKING** API contract changes for clients beyond faster responses

## Non-goals

- Prefetch chapter pages from manga detail before navigation (follow-up)
- Cover image as timed loading placeholder
- Changing scrape providers or removing the image proxy/Referer path

## Risks

- In-memory cache on serverless may be per-instance (still helps bursty page proxies on the same instance)
- Stale page URLs if CDN links expire within TTL — keep TTL short (minutes)
- Scraping/legal constraints unchanged; cache only reduces duplicate upstream calls
