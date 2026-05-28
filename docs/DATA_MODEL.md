# Data Model — MangaTrack

## Arquitectura de datos

- **Catálogo (manga, capítulos, portadas, páginas):** [MangaDex API](https://api.mangadex.org) vía BFF en rutas `/api/manga/*` y `/api/chapters/*`. No se persisten tablas `Manga` / `Chapter` en Neon.
- **Estado de usuario:** Neon PostgreSQL (bookmarks, historial, notificaciones). Ramas: **`main`** (prod), **`dev`** (local/previews). Ver `docs/ENV.md`.

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

Manga en favoritos (bookmark) por usuario; ID externo MangaDex.

| Campo        | Tipo   | Descripción                    |
| ------------ | ------ | ------------------------------ |
| `userId`     | FK     | → User                         |
| `mangaDexId` | UUID   | ID manga en MangaDex           |

**Unique:** `(userId, mangaDexId)` — índice en `mangaDexId` para webhooks de capítulo.

### UserPushToken (`user_push_tokens`)

Tokens FCM por dispositivo (varios por usuario).

| Campo   | Tipo   | Descripción              |
| ------- | ------ | ------------------------ |
| `userId`| FK     | → User                   |
| `token` | String | Token FCM del dispositivo|
| `platform` | PushTokenPlatform | `WEB` \| `ANDROID` |

**Unique:** `(userId, token)`

### ReadingHistory

Progreso por capítulo (IDs MangaDex).

| Campo          | Tipo     | Descripción              |
| -------------- | -------- | ------------------------ |
| `userId`       | FK       | → User                   |
| `mangaDexId`   | UUID     | Manga en MangaDex        |
| `chapterDexId` | UUID     | Capítulo en MangaDex     |
| `readAt`       | DateTime | Marca de lectura         |

**Unique:** `(userId, chapterDexId)`

### Notification

Notificación in-app; títulos de manga/capítulo se resuelven contra MangaDex al crear.

| Campo          | Tipo             | Descripción                    |
| -------------- | ---------------- | ------------------------------ |
| `type`         | NotificationType | NEW_CHAPTER, MANGA_UPDATE, SYSTEM |
| `mangaDexId`   | UUID?            | Manga relacionado              |
| `chapterDexId` | UUID?            | Capítulo (NEW_CHAPTER)         |
| `read`         | Boolean          | Leída o no                     |

## Catálogo (MangaDex, no en BD)

Tipos de aplicación en `src/lib/mangadex/types.ts`:

- `MangaListItem` / `MangaDetail` — búsqueda y detalle
- `ChapterListItem` — lista en ficha de manga
- Reader payload — URLs de páginas desde `/at-home/server/{chapterId}`

URLs de la app: `/manga/[mangaDexId]`, `/reader/[chapterDexId]`.

## Límites de negocio

- Basic: máximo **50** favorites (`UserFavorite` por usuario).
- Premium: sin límite en lógica de API.

## Mantenimiento de schema

No hay seed de catálogo. Tras clonar o cambiar `schema.prisma`:

```powershell
npm run db:generate
npm run db:sync
npm run db:cleanup-catalog   # elimina tablas legacy mangas/chapters si quedaron
```

Los favorites e historial se crean en uso (búsqueda + UI), con UUIDs de MangaDex.

Si la BD aún tiene la tabla legacy `user_mangas`:

```powershell
npx dotenv -e .env.local -- prisma db execute --file prisma/rename-user-mangas-to-favorites.sql --schema prisma/schema.prisma
```
