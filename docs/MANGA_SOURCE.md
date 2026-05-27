# Fuente de catálogo — MangaDex

## Estado actual

- **Catálogo activo:** [MangaDex API v5](https://api.mangadex.org) (`src/lib/mangadex/`).
- **Neon:** solo `users`, `user_mangas`, `reading_history`, `notifications`.
- **No hay** tablas `mangas` / `chapters` ni `npm run db:seed`.

## Variables

Ver `docs/ENV.md` (`MANGADEX_API_BASE_URL`, `MANGADEX_CONTENT_RATINGS`, `MANGADEX_DEFAULT_LOCALE`).

## Legacy

- **MangaFeeling** (`MANGA_FEELING_BASE_URL`) — deprecado; no usar para catálogo nuevo.
- Skill `.cursor/skills/mangafeeling-ingest/` — solo referencia histórica.

## Migración

Plan completado en código: `docs/MANGADEX_MIGRATION_PLAN.md`.
