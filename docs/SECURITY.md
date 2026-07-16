# Seguridad — MangaTrack

## Modelo general

MangaTrack usa **Clerk** en el edge (`middleware.ts`) y **API routes** como único punto de acceso a **Neon**. El navegador no recibe `DATABASE_URL`.

El **catálogo** viene de **Consumet** self-hosted (`CONSUMET_BASE_URL`), solo vía BFF (`/api/manga/*`, `/api/chapters/*`, `/api/catalog/cover`). El cliente no llama a Consumet ni a CDNs scrapeados directamente (covers/páginas pasan por proxy con Referer).

## Autorización (aplicación)

Toda ruta que lee o escribe datos de usuario debe:

1. Obtener sesión con `getCurrentUser()` (o equivalente Clerk).
2. Filtrar por `user.id` interno (cuid), nunca por `userId` enviado en el body sin validar.

| Recurso | Regla |
|---------|--------|
| Favorites / bookmarks | Solo `where: { userId: currentUser.id }` |
| Reading history | Idem |
| Notifications | Idem |
| Tier / Stripe | Solo webhooks firmados + metadata validada |

## Identificadores externos (Consumet)

- Identidad de listing = `(provider, externalMangaId)` / `(provider, externalChapterId)`.
- Los ids de scrape (p. ej. `one_piece/100`) pueden contener `/`; en rutas App Router se codifican con `~` (`src/lib/consumet/ids.ts`).
- El catálogo es público vía BFF autenticado; el riesgo está en **favorites/historial**, protegidos por `userId`.

## RLS en Neon (opcional)

Por defecto el proyecto **no** activa Row Level Security en Postgres: Prisma usa un rol de servidor de confianza.

Si se activa RLS (notas históricas en `docs/MANGADEX_MIGRATION_PLAN.md` §4.2; el plan está superseded):

- Establecer `app.user_id` por request antes de queries.
- Migraciones con rol superuser separado.
- Añadir tests de aislamiento entre usuarios.

## Consumet / proxy de imágenes

- Llamadas solo desde servidor (BFF).
- `GET /api/catalog/cover` y proxy de páginas de capítulo: limitar concurrencia; no abrir proxy a URLs arbitrarias sin allowlist de hosts/providers.
- No usar `api.consumet.org` público ni exponer `CONSUMET_BASE_URL` secrets al cliente (la base URL es origen, no secret, pero el tráfico debe permanecer server-side).

## Secretos

- `DATABASE_URL`, `CLERK_*`, `STRIPE_*`, `RESEND_*`, `INNGEST_*`, `FIREBASE_*` solo en servidor y Vercel env.
- No commitear `.env.local`.
