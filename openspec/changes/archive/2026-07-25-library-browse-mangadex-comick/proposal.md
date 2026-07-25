---
linear_story_id: WAY-81
linear_story_identifier: WAY-81
linear_story_title: "[MAN] Library progress, Browse feeds y providers MangaDex/ComicK"
linear_story_url: https://linear.app/wayool/issue/WAY-81/man-library-progress-browse-feeds-y-providers-mangadexcomick
linear_story_state: Todo
linear_team: Wayool
linear_project: mangatrack
---

## Why

La Library actual es un grid de “Bookmarks” sin progreso ni estado de lectura, y no hay superficie de descubrimiento (Browse) comparable a trackers modernos. Consumet Wayool ya expone `mangadex` y `comick` (200); la app sigue limitada a `mangahere`/`mangapill`. Ahora conviene alinear UX + allowlist sin abrir gamificación ni providers rotos (`weebcentral` 500 por Cloudflare).

## What Changes

- Renombrar la superficie de favoritos a **Library**; en cada tile: badge **Reading** (si hay `reading_history`) y **barra de progreso** (`max capítulo leído / total caps`) sin migration Prisma.
- Añadir **Browse**: icono en `GlobalHeader` + ruta `/browse` con New releases, Latest updates y Trending (periodos Today / Week / Month).
- Ampliar allowlist Consumet a `mangahere,mangapill,mangadex,comick` (defaults, env, search UI, referers/CDN, docs, tests).
- **No** incluir `weebcentral` en allowlist hasta que Consumet devuelva 200 en search.

### Non-goals

- Discover / Profile social / XP / leaderboards / community reading links / Import MAL·AniList.
- Montar o depurar Consumet en la VPS desde este repo (`weebcentral` CF queda como follow-up ops).
- Autodeploy Consumet (hoy es rebuild manual en VPS).
- Cambiar schema Neon (status/rating/tags persistidos).

### Risks

- Feeds Browse reales no existen en Consumet (`/recent` es search del string); hace falta un BFF de feeds (p. ej. MangaDex API solo para listados) — riesgo de inconsistencia con la regla “catálogo solo vía Consumet”.
- Scrapers (`comick`) y CDN Referers pueden fallar; UX debe tolerar errores por provider.
- Progress en Library depende de `info` Consumet (coste/latencia al hidratar bookmarks); hay que limitar concurrencia.

## Capabilities

### New Capabilities

- `library-progress-ux`: Copy Library, badge Reading y barra de progreso en tiles a partir de history + chapter list/total.
- `browse-feeds`: Página `/browse` + nav header; feeds New / Latest / Trending con periodos Today|Week|Month.
- `catalog-providers-expansion`: Allowlist y soporte de cliente para `mangadex` + `comick` (env, defaults, referers, docs, tests).

### Modified Capabilities

- _(none — no hay `openspec/specs/` canónicos archivados aún; el allowlist previo vive solo en el change `integrar-consumet-catalog`)_

## Impact

- UI: `DashboardContent`, `GlobalHeader`, nueva `/browse`, posiblemente `search` defaults.
- API: bookmarks enrichment (progress fields); nuevos endpoints Browse BFF.
- Env/docs: `CONSUMET_PROVIDER_ALLOWLIST`, `docs/MANGA_SOURCE.md`, `docs/ENV.md`, `.env.example`.
- Tests: Jest mappers/allowlist/progress helpers; smoke manual Consumet.
- Ops: Vercel env allowlist; Consumet VPS fuera de scope salvo issue follow-up `weebcentral`.
- Linear: [WAY-81](https://linear.app/wayool/issue/WAY-81/man-library-progress-browse-feeds-y-providers-mangadexcomick).
