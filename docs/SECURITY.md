# Seguridad — MangaTrack

## Modelo general

MangaTrack usa **Clerk** en el edge (`middleware.ts`) y **API routes** como único punto de acceso a **Neon**. El navegador no recibe `DATABASE_URL`.

El **catálogo** viene de **MangaDex** (solo lectura, vía servidor). No hay credenciales MangaDex en el cliente.

## Autorización (aplicación)

Toda ruta que lee o escribe datos de usuario debe:

1. Obtener sesión con `getCurrentUser()` (o equivalente Clerk).
2. Filtrar por `user.id` interno (cuid), nunca por `userId` enviado en el body sin validar.

| Recurso | Regla |
|---------|--------|
| Bookmarks | Solo `where: { userId: currentUser.id }` |
| Reading history | Idem |
| Notifications | Idem |
| Tier / Stripe | Solo webhooks firmados + metadata validada |

## Identificadores externos (MangaDex)

- `mangaDexId` y `chapterDexId` son **públicos** (UUID en MangaDex).
- Validar formato UUID en entrada; no confundir con `user.id` interno.
- Un usuario no puede “adivinar” datos de otro usuario solo con un UUID de manga (el catálogo es público); el riesgo está en **bookmarks/historial**, protegidos por `userId`.

## RLS en Neon (opcional)

Por defecto el proyecto **no** activa Row Level Security en Postgres: Prisma usa un rol de servidor de confianza.

Si se activa RLS (ver `docs/MANGADEX_MIGRATION_PLAN.md` §4.2):

- Establecer `app.user_id` por request antes de queries.
- Migraciones con rol superuser separado.
- Añadir tests de aislamiento entre usuarios.

## MangaDex

- Llamadas solo desde servidor (BFF).
- Respetar rate limits; no scrapear fuera de la API documentada.
- Filtrar `contentRating` acorde a política del producto.

## Secretos

- `DATABASE_URL`, `CLERK_*`, `STRIPE_*`, `RESEND_*` solo en servidor y Vercel env.
- No commitear `.env.local`.
