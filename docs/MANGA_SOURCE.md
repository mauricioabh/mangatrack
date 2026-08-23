# Fuente de catálogo — Consumet (Wayool)

## Estado actual

- **Catálogo activo:** Consumet self-hosted en `CONSUMET_BASE_URL` (ej. `https://consumet.wayool.com`) vía `src/lib/consumet/`.
- Providers de lectura (allowlist): `mangahere`, `mangapill`, `mangadex` por defecto (`CONSUMET_PROVIDER_ALLOWLIST`).
- **`comick` excluido:** Consumet search/info 200, pero covers/pages en `*.comicknew.pictures` responden Cloudflare 403 (sin image-proxy en VPS no hay lector usable).
- **`weebcentral` excluido:** montado en Consumet VPS pero search responde 500 (Cloudflare challenge).
- **Neon:** solo estado de usuario (`users`, `user_favorites`, `reading_history`, `notifications`, push tokens) keyed por `(provider, externalId)`.
- **No hay** tablas `mangas` / `chapters` ni `npm run db:seed`.
- **Lectura / search / info / páginas:** solo vía Consumet (no `api.consumet.org` público).
- **Excepción Browse:** feeds de descubrimiento (`/browse`, `GET /api/browse`) usan `api.mangadex.org` solo para listados metadata (New / Latest / Trending). Abrir una serie sigue el flujo Consumet (`/manga/mangadex/{id}` o search). Ver `src/lib/browse/`.

## BFF

| Flujo | Ruta app | API |
| ----- | -------- | --- |
| Búsqueda multi-provider | `/search` | `GET /api/manga/search?query=` (`match`, `providers`) |
| Browse feeds (MD metadata) | `/browse` | `GET /api/browse?mode=&period=` |
| Conteo de capítulos (enrich search) | — | `GET /api/manga/chapter-count?provider=&id=` |
| Detalle + capítulos | `/manga/[provider]/[mangaId]` | `GET /api/manga/[provider]/[mangaId]` |
| Reader | `/reader/[provider]/[chapterId]` | `GET /api/chapters/[provider]/[chapterId]` (+ proxy pages) |
| Cover proxy | — | `GET /api/catalog/cover?url=&provider=` |

Search UI enriquece conteos en background (concurrency limitada) y muestra badge **N caps**. Covers scrape CDN pasan por el proxy (Referer + retry).

La búsqueda reordena resultados por relevancia de título (frase exacta arriba; ruido tipo OR abajo). `match=exact` o comillas `"demon slayer"` filtran a frase completa. En `/search`, el filtro **Providers** es un dropdown multi-select (checkboxes) junto a status/genre; solo consulta el subset del allowlist (`providers=`). Trigger táctil `min-h-11` para PWA.

**Search UX:** la búsqueda es explícita (botón Search / Enter / deep link `?q=`). Tippear o cambiar filtros no llama a Consumet hasta confirmar. `GET /api/manga/search` acepta `page` y responde `pagination.hasMore` (OR de `hasNextPage` por provider). La UI hace infinite scroll con sentinel; sin total global de catálogo. Misma obra en distintos providers permanece como filas separadas (caps pueden diferir).

IDs con `/` (p. ej. MangaPill `3069/naruto`) se codifican con `~` en rutas App Router (`3069~naruto`); `%2F` no es fiable. El info de MangaPill a menudo viene sin `image` — el BFF sintetiza cover desde el id numérico. Páginas de lectura usan Referer por provider (sin eso el CDN de MangaPill responde 403).

**MangaDex (Consumet):** info/read van en path-style (`/manga/mangadex/info/{id}`, `/manga/mangadex/read/{chapterId}`). El estilo query `?id=` se desvía a search en este provider. Covers se reescriben a `uploads.mangadex.org/.../*.256.jpg` (más fiable que `mangadex.org/covers`).

**ComicK:** no está en allowlist. CDN de imágenes bloqueado por Cloudflare; reactivar solo tras image-proxy en Consumet VPS (WAY-83).

## Notificaciones de capítulo

Cron Inngest diario (`0 2 * * *`, función `poll-favorite-chapters-daily`) consulta Consumet `info` por cada favorite y compara con `lastNotifiedChapterId`.  
La detección del capítulo más reciente usa `getLatestChapterUpdate` (misma regla que badges de biblioteca: `publishedAt` cuando existe; si no, fallback de orden de lista)—no `chapters[0]` a ciegas. El progreso de lectura del usuario no bloquea el aviso.  
Cómo probarlo en local: `docs/TESTING.md` (sección Inngest).  
`/api/webhook/mangadex` responde **410 Gone** (ya no es el path de notificaciones).

## Variables

Ver `docs/ENV.md` (`CONSUMET_BASE_URL`, `CONSUMET_TIMEOUT_MS`, `CONSUMET_PROVIDER_ALLOWLIST`, `CONSUMET_MANGA_PROVIDER` opcional).

**Deploy ops:** en Vercel, alinear `CONSUMET_PROVIDER_ALLOWLIST` con el default (`mangahere,mangapill,mangadex`). Rebuild Consumet en la VPS es manual y está fuera de este repo.

## Legacy

- **MangaDex API directa para reader** — removida del app (`src/lib/mangadex` eliminado). Solo Browse feeds vuelven a MD API (metadata).
- **MangaFeeling** (`MANGA_FEELING_BASE_URL`) — deprecado.
- Plan histórico: `docs/MANGADEX_MIGRATION_PLAN.md` (superseded por cutover Consumet).
