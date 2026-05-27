---
name: mangafeeling-ingest
description: Design or implement manga catalog ingest from MangaFeeling. Use when working on scraping, sync jobs, sourceUrl/sourceId fields, or MANGA_FEELING_BASE_URL.
---

# MangaFeeling ingest

## Before coding

1. Read `docs/MANGA_SOURCE.md` and `docs/DATA_MODEL.md`
2. Read `prisma/schema.prisma` (`sourceUrl`, `sourceId` on Manga and Chapter)
3. Prefer an OpenSpec change (`/opsx-propose mangafeeling-ingest`) for non-trivial work

## Not implemented yet

- No ingest service in `src/` today
- Seed data: `prisma/seed.ts` (mock only)

## Implementation checklist (when building)

- [ ] Config: `MANGA_FEELING_BASE_URL` from env
- [ ] Upsert Manga by `sourceId`; unique `slug` strategy documented
- [ ] Upsert Chapter with `pages[]` as image URLs
- [ ] Rate limits, retries, logging (no secrets in logs)
- [ ] Admin-only or cron route for triggering ingest
- [ ] Update `docs/MANGA_SOURCE.md`, `docs/PHASES.md`, API table in README
- [ ] Do not commit copyrighted images — URLs only in DB

## Testing

- Unit tests for parsers/mappers
- Manual run against dev DB with small batch first
