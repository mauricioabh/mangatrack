# Fuente de catálogo — Consumet (Wayool)

## Estado actual

- **Catálogo activo:** Consumet self-hosted en `CONSUMET_BASE_URL` (ej. `https://consumet.wayool.com`) vía `src/lib/consumet/`.
- Providers de lectura (allowlist): `mangahere`, `mangapill` por defecto (`CONSUMET_PROVIDER_ALLOWLIST`).
- **Neon:** solo estado de usuario (`users`, `user_favorites`, `reading_history`, `notifications`, push tokens) keyed por `(provider, externalId)`.
- **No hay** tablas `mangas` / `chapters` ni `npm run db:seed`.
- **No** se llama a `api.mangadex.org` ni a `api.consumet.org` públicos.

## BFF

| Flujo | Ruta app | API |
| ----- | -------- | --- |
| Búsqueda multi-provider | `/search` | `GET /api/manga/search?query=` |
| Conteo de capítulos (enrich search) | — | `GET /api/manga/chapter-count?provider=&id=` |
| Detalle + capítulos | `/manga/[provider]/[mangaId]` | `GET /api/manga/[provider]/[mangaId]` |
| Reader | `/reader/[provider]/[chapterId]` | `GET /api/chapters/[provider]/[chapterId]` (+ proxy pages) |
| Cover proxy | — | `GET /api/catalog/cover?url=&provider=` |

Search UI enriquece conteos en background (concurrency limitada) y muestra badge **N caps**. Covers scrape CDN pasan por el proxy (Referer + retry).

## Notificaciones de capítulo

Cron Inngest diario (`0 2 * * *`, función `poll-favorite-chapters-daily`) consulta Consumet `info` por cada favorite y compara con `lastNotifiedChapterId`.  
Cómo probarlo en local: `docs/TESTING.md` (sección Inngest).  
`/api/webhook/mangadex` responde **410 Gone** (ya no es el path de notificaciones).

## Variables

Ver `docs/ENV.md` (`CONSUMET_BASE_URL`, `CONSUMET_TIMEOUT_MS`, `CONSUMET_PROVIDER_ALLOWLIST`, `CONSUMET_MANGA_PROVIDER` opcional).

## Legacy

- **MangaDex API directa** — removida del app (`src/lib/mangadex` eliminado).
- **MangaFeeling** (`MANGA_FEELING_BASE_URL`) — deprecado.
- Plan histórico: `docs/MANGADEX_MIGRATION_PLAN.md` (superseded por cutover Consumet).
