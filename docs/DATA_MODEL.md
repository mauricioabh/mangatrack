# Data Model — MangaTrack

## Arquitectura de datos

- **Catálogo (manga, capítulos, portadas, páginas):** Consumet API self-hosted (`CONSUMET_BASE_URL`) vía BFF en `/api/manga/*` y `/api/chapters/*`. No se persisten tablas `Manga` / `Chapter` en Neon.
- **Estado de usuario:** Neon PostgreSQL (favorites, historial, notificaciones) keyed por `(provider, externalId)`. Ramas: **`main`** (prod), **`dev`** (local/previews). Ver `docs/ENV.md`.

## Entidades en Neon

### User

Cuenta sincronizada con Clerk.

| Campo                | Tipo       | Descripción                          |
| -------------------- | ---------- | ------------------------------------ |
| `id`                 | cuid       | PK interna                           |
| `clerkId`            | String     | ID Clerk (único)                     |
| `email`              | String     | Email (único)                        |
| `name`, `avatar`     | String?    | Perfil                               |
| `tier`               | UserTier   | `BASIC` \| `PREMIUM`                 |
| `emailNotifications` | Boolean    | Preferencia de emails                |

**Relaciones:** favorites (`UserFavorite`), `UserPushToken`, `ReadingHistory`, `Notification`

### UserFavorite (`user_favorites`)

Manga en favoritos (bookmark) por usuario; identidad = provider + id externo Consumet.

| Campo                   | Tipo    | Descripción                                      |
| ----------------------- | ------- | ------------------------------------------------ |
| `userId`                | FK      | → User                                           |
| `provider`              | String  | ej. `mangahere`, `mangapill`                     |
| `externalMangaId`       | String  | ID manga en ese provider                         |
| `lastNotifiedChapterId` | String? | Watermark para poll diario de capítulos nuevos   |

**Unique:** `(userId, provider, externalMangaId)` — índice `(provider, externalMangaId)` para jobs.

### UserPushToken (`user_push_tokens`)

Tokens FCM por dispositivo (varios por usuario).

| Campo      | Tipo              | Descripción              |
| ---------- | ----------------- | ------------------------ |
| `userId`   | FK                | → User                   |
| `token`    | String            | Token FCM del dispositivo|
| `platform` | PushTokenPlatform | `WEB` \| `ANDROID`       |

**Unique:** `(userId, token)`

### ReadingHistory

Progreso por capítulo (IDs de provider Consumet).

| Campo               | Tipo     | Descripción              |
| ------------------- | -------- | ------------------------ |
| `userId`            | FK       | → User                   |
| `provider`          | String   | Provider Consumet        |
| `externalMangaId`   | String   | Manga en ese provider    |
| `externalChapterId` | String   | Capítulo en ese provider |
| `readAt`            | DateTime | Marca de lectura         |

**Unique:** `(userId, provider, externalChapterId)`

### Notification

Notificación in-app; títulos de manga/capítulo se resuelven contra Consumet al crear.

| Campo               | Tipo             | Descripción                    |
| ------------------- | ---------------- | ------------------------------ |
| `type`              | NotificationType | NEW_CHAPTER, MANGA_UPDATE, SYSTEM |
| `provider`          | String?          | Provider del listing           |
| `externalMangaId`   | String?          | Manga relacionado              |
| `externalChapterId` | String?          | Capítulo (NEW_CHAPTER)         |
| `read`              | Boolean          | Leída o no                     |

## Catálogo (Consumet, no en BD)

Tipos de aplicación en `src/lib/consumet/types.ts`:

- `MangaSummary` / `MangaDetail` — búsqueda y detalle
- `Chapter` — lista en ficha de manga
- `Page` — URLs de páginas (+ Referer) desde Consumet read

URLs de la app: `/manga/[provider]/[mangaId]`, `/reader/[provider]/[chapterId]` (chapter ids con `/` se codifican con `~`).

## Límites de negocio

- Basic: máximo **50** favorites (`UserFavorite` por usuario).
- Premium: sin límite en lógica de API.

## Mantenimiento de schema

No hay seed de catálogo. Tras clonar o cambiar `schema.prisma`:

```powershell
npm run db:generate
npm run db:wipe-library   # limpia favorites/historial/notif manga antes de cutover
npm run db:sync
npm run db:cleanup-catalog   # elimina tablas legacy mangas/chapters si quedaron
```

Cutover provider-scoped: wipe + push (ver `prisma/wipe-legacy-library.sql`).
