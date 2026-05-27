# Plan de migración — Catálogo MangaDex + Neon (estado de usuario)

> Documento maestro para la transición de catálogo local (Prisma `Manga` / `Chapter`) a **MangaDex API v5**, manteniendo en **Neon** solo datos de usuario y negocio.

**Estado:** Implementado en código (pendiente `db:push` en Neon por entorno)  
**Última revisión:** Mayo 2026

---

## 1. Objetivo y alcance

### Objetivo

- **Catálogo, búsqueda, detalle, capítulos y lector** → datos en tiempo real desde [MangaDex API](https://api.mangadex.org/) (`https://api.mangadex.org`).
- **Bookmarks, historial, notificaciones, tier Stripe, perfil** → siguen en **Neon** vía Prisma.
- URLs y APIs usan **UUID de MangaDex** (`mangaDexId`, `chapterDexId`), no `slug` ni `cuid` de tablas `mangas` / `chapters`.

### Fuera de alcance (v1)

- Cuentas / follows nativos de MangaDex (se usa Clerk + bookmarks propios).
- Sincronizar catálogo completo a Neon (no hay tabla `Manga` como fuente de verdad).
- MangaFeeling (`MANGA_FEELING_BASE_URL`) — sustituido por MangaDex; ver deprecación en `docs/MANGA_SOURCE.md`.

### Entregables

1. Schema Prisma reducido + migración de datos de bookmarks/historial.
2. Capa `src/lib/mangadex/` (cliente, mappers, tipos).
3. API routes como BFF (proxy + auth + Neon).
4. Front: rutas `/manga/[mangaId]`, `/reader/[chapterDexId]`.
5. Docs, env, tests (unit + E2E + contratos).
6. Seguridad documentada (app-layer + RLS opcional en Neon).

---

## 2. Arquitectura objetivo

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js (BFF)   │────▶│  MangaDex API   │
│  (React)    │     │  /api/manga/*    │     │  (catálogo)     │
└─────────────┘     │  /api/chapters/* │     └─────────────────┘
                    │  Clerk session   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Neon (Prisma)   │
                    │  users, bookmarks│
                    │  history, notif. │
                    └──────────────────┘
```

| Capa | Responsabilidad |
|------|-----------------|
| MangaDex | Título, cover, status, tags, feed de capítulos, páginas (at-home) |
| Neon | `User`, `Bookmark`, `ReadingHistory`, `Notification`, tier, prefs email |
| BFF | Autenticación Clerk, límites Basic/Premium, composición MangaDex + Neon |

---

## 3. Cambios en Neon (Prisma)

### 3.1 Modelo objetivo

| Modelo | Campos clave | Notas |
|--------|--------------|--------|
| **User** | Sin cambios estructurales | Opcional: `stripeCustomerId String?` |
| **Bookmark** (renombrar `UserManga`) | `userId`, `mangaDexId` (UUID), `createdAt` | Unique `(userId, mangaDexId)`. Sin FK a `Manga`. |
| **ReadingHistory** | `userId`, `mangaDexId`, `chapterDexId`, `readAt` | Unique `(userId, chapterDexId)`. Sin FK a `Chapter`. |
| **Notification** | `userId`, `type`, `title`, `message`, `mangaDexId?`, `chapterDexId?`, `read` | Renombrar `mangaId`/`chapterId` → `*DexId` (strings UUID). |
| ~~Manga~~ | **Eliminar** (v1) | Tras migrar referencias. |
| ~~Chapter~~ | **Eliminar** (v1) | Tras migrar referencias. |

### 3.2 Campos opcionales (fase 2)

| Campo | Modelo | Uso |
|-------|--------|-----|
| `lastReadChapterDexId` | Bookmark | “Continuar leyendo” rápido |
| `lastNotifiedChapterDexId` | Bookmark o tabla `MangaFollowState` | Job “nuevo capítulo” |
| `MangaCache` | `mangaDexId`, `title`, `coverUrl`, `cachedAt` | Rate limits / emails offline |

### 3.3 Migración de datos existentes

Solo aplica si hay datos reales en producción (hoy: seed mock).

| Paso | Acción |
|------|--------|
| M1 | Si `Manga.sourceId` ya es UUID MangaDex → copiar a `Bookmark.mangaDexId`. |
| M2 | Si solo hay `slug` / cuid interno → script one-off: buscar en MangaDex por título o marcar bookmark huérfano para borrado. |
| M3 | `ReadingHistory`: mapear `chapter.sourceId` → `chapterDexId`, `manga.sourceId` → `mangaDexId`. |
| M4 | Drop tablas `chapters`, `mangas` y FKs antiguos. |

**Seed:** reemplazar `prisma/seed.ts` — solo `User` de prueba + bookmarks de ejemplo con UUIDs MangaDex conocidos (p. ej. un manga fijo de la doc MangaDex).

### 3.4 Índices recomendados

```prisma
@@unique([userId, mangaDexId])      // bookmarks
@@unique([userId, chapterDexId])   // reading_history
@@index([userId, createdAt])       // listados
@@index([mangaDexId])               // jobs por manga
```

---

## 4. Seguridad y RLS (Neon)

### 4.1 Modelo actual (sin RLS Postgres)

Hoy la seguridad es **100 % en la aplicación**:

- `middleware.ts` — Clerk `protect()` en rutas sensibles.
- API routes — `getCurrentUser()` y queries con `where: { userId: user.id }`.
- El cliente **nunca** habla con Neon directamente.

**Recomendación v1:** mantener este modelo y endurecer queries (auditoría de que todo `findMany` de bookmarks/history/notifications filtra por `userId`).

### 4.2 RLS en Neon (opcional, fase de endurecimiento)

MangaTrack **no usa Supabase**; si se activa RLS en Neon:

| Tabla | Política (concepto) |
|-------|---------------------|
| `users` | Solo fila donde `id = current_setting('app.user_id')` |
| `user_mangas` | `user_id = current_setting('app.user_id')` |
| `reading_history` | Idem |
| `notifications` | Idem |

**Requisitos con Prisma:**

1. Por request: `SET LOCAL app.user_id = '<cuid interno>'` tras validar Clerk (transacción o middleware Prisma `$extends`).
2. Rol de BD distinto para migraciones vs runtime.
3. Tests que demuestren que un `userId` A no lee datos de B incluso con query mal formada.

**Alternativa más simple:** no activar RLS Postgres y documentar en `docs/SECURITY.md` que el BFF es el único cliente de Neon (connection string solo en servidor).

### 4.3 MangaDex

- API pública para lectura; respetar [rate limits](https://api.mangadex.org/docs/) y `contentRating[]` en búsquedas.
- No exponer API keys de MangaDex al cliente (todas las llamadas vía BFF).
- Configurar `next.config` `images.remotePatterns` para `uploads.mangadex.org`.

### 4.4 Checklist seguridad (pre-merge)

- [ ] Ningún endpoint de usuario acepta `userId` del body sin validar sesión.
- [ ] Bookmarks: solo CRUD del `user.id` autenticado.
- [ ] Límite Basic (50 bookmarks) sigue en servidor.
- [ ] Validación `z.string().uuid()` para `mangaDexId` / `chapterDexId`.
- [ ] Webhooks Clerk/Stripe sin cambios de superficie.

---

## 5. Capa MangaDex (`src/lib/mangadex/`)

### 5.1 Módulos

| Archivo | Responsabilidad |
|---------|-----------------|
| `client.ts` | `fetch` base URL, timeouts, errores, rate limit backoff |
| `types.ts` | Tipos JSON:API (Entity, MangaAttributes, Tag, CoverArt) |
| `mappers.ts` | `toMangaListItem`, `toMangaDetail`, `toChapterListItem` |
| `covers.ts` | `buildCoverUrl(mangaId, fileName, size?)` |
| `locale.ts` | `pickLocalized(title \| description, prefer: ['en','es'])` |
| `tags.ts` | Cache en memoria de `GET /manga/tag` (géneros → UUID) |

### 5.2 Contrato hacia el front (estable)

Alinear con lo que ya consume `search/page.tsx` y componentes:

```ts
type MangaListItem = {
  id: string;           // mangaDexId
  title: string;
  description?: string;
  coverImage?: string;
  status: "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED";
  genres: string[];
  author?: string;
};

type MangaDetail = MangaListItem & {
  artist?: string;
  chapters: ChapterListItem[];
};

type ChapterListItem = {
  id: string;           // chapterDexId
  mangaDexId: string;
  title: string;
  chapterNumber: number;
  publishedAt?: string;
};
```

### 5.3 Queries MangaDex usadas

| Feature | Endpoint | Includes / notas |
|---------|----------|------------------|
| Search / Browse | `GET /manga` | `title`, `limit`, `offset`, `includes[]=cover_art`, `includes[]=author`, `contentRating[]=safe`, `contentRating[]=suggestive` |
| Detalle | `GET /manga/{id}` | + tags, artist |
| Capítulos | `GET /manga/{id}/feed` o aggregate | Orden por `chapter` / `volume` |
| Páginas lector | At-home server / chapter pages | Seguir doc oficial MangaDex |
| Género filter | `includedTags[]` | Resolver nombre → UUID vía `/manga/tag` |

### 5.4 Variables de entorno

Añadir a `.env.example` y `docs/ENV.md`:

| Variable | Descripción |
|----------|-------------|
| `MANGADEX_API_BASE_URL` | Default `https://api.mangadex.org` |
| `MANGADEX_DEFAULT_LOCALE` | `en` o `es` |
| `MANGADEX_CONTENT_RATINGS` | `safe,suggestive` (lista) |

Deprecar: `MANGA_FEELING_BASE_URL`.

---

## 6. Cambios en API routes (BFF)

| Ruta actual | Cambio |
|-------------|--------|
| `GET /api/manga/search` | Proxy MangaDex + mapper; paginación `offset`/`limit` |
| `GET /api/manga/[slug]` | → `GET /api/manga/[mangaId]` — MangaDex + capítulos feed |
| `GET /api/chapters/[chapterId]` | → `chapterDexId`; metadatos MangaDex + páginas at-home |
| `GET/POST/DELETE /api/manga/bookmark` | `mangaDexId` (uuid); sin `db.manga.findUnique` |
| `GET /api/manga/bookmarks` | Lista Neon → batch enrich MangaDex (`/manga` con ids o paralelo) |
| `GET/POST /api/reading-history` | `mangaDexId`, `chapterDexId` |
| `POST /api/simulate-email-notification` | UUIDs de prueba o env |
| Webhooks / user / stripe | Sin cambios de flujo |

**Search pública:** hoy el comentario Swagger dice que search es público; el `middleware` protege `/api/manga(.*)`. Decidir: dejar search autenticado (actual) o excluir `GET /api/manga/search` del matcher.

---

## 7. Cambios en frontend

| Área | Cambio |
|------|--------|
| `app/manga/[slug]/` | Renombrar a `app/manga/[mangaId]/` |
| `search/page.tsx` | `Link href={/manga/${manga.id}}` (ya es id lógico) |
| `MangaDetailContent` | Prop `mangaId`; fetch `/api/manga/${mangaId}` |
| `reader/[chapterId]/` | Renombrar param a `chapterDexId`; lector consume URLs MangaDex |
| `DashboardContent`, `bookmarks-list` | Enriquecimiento desde API compuesta |
| `bookmark-button` | Pasar `mangaDexId` |
| `lib/validations.ts` | `cuid` → `uuid` en schemas de manga/capítulo |
| `next.config.ts` | `images.remotePatterns` → `uploads.mangadex.org` |

---

## 8. Fases de implementación

### Fase A — Fundamentos (1–2 días)

- [ ] OpenSpec change: `mangadex-catalog-migration` (`/opsx-propose`)
- [ ] `src/lib/mangadex/*` + tests unitarios de mappers
- [ ] `.env.example`, `docs/ENV.md`, `docs/TECH_STACK.md`
- [ ] `next.config` imágenes MangaDex

### Fase B — Schema Neon (1 día)

- [ ] Nuevo schema Prisma (Bookmark, ReadingHistory, Notification renames)
- [ ] Migración SQL + script de datos si aplica
- [ ] Actualizar `docs/DATA_MODEL.md`
- [ ] Seed mínimo (user + bookmarks con UUIDs reales)

### Fase C — BFF catálogo (2–3 días)

- [ ] `GET /api/manga/search` → MangaDex
- [ ] `GET /api/manga/[mangaId]` → MangaDex
- [ ] Tests de integración con mocks HTTP (MSW o `fetch` mock)

### Fase D — Bookmarks e historial (1–2 días)

- [ ] CRUD bookmark por `mangaDexId`
- [ ] `GET /api/manga/bookmarks` compose Neon + MangaDex
- [ ] Reading history con UUIDs
- [ ] Dashboard / detail bookmark flows

### Fase E — Lector (2–4 días)

- [ ] Capítulos + páginas vía MangaDex at-home
- [ ] Marcar leído → Neon `chapterDexId`
- [ ] Navegación prev/next capítulo

### Fase F — Seguridad y RLS (1 día, opcional)

- [ ] Auditoría queries `userId`
- [ ] `docs/SECURITY.md`
- [ ] (Opcional) RLS policies + Prisma middleware `SET LOCAL`

### Fase G — Limpieza y docs (1 día)

- [ ] Eliminar modelos `Manga` / `Chapter` y código muerto
- [ ] Actualizar README, SETUP, swagger, `docs/MANGA_SOURCE.md` → `docs/MANGADEX.md`
- [ ] Deprecar skill `mangafeeling-ingest`; skill `mangadex-client`
- [ ] `docs/PHASES.md` — marcar migración

---

## 9. Documentación a actualizar

| Documento | Cambios |
|-----------|---------|
| `docs/DATA_MODEL.md` | Solo User + bookmarks + history + notifications |
| `docs/ENV.md` | MangaDex vars; quitar MangaFeeling |
| `docs/TECH_STACK.md` | MangaDex como catálogo |
| `docs/PRD.md` | Fuente de contenido, riesgos rate limit |
| `docs/MANGA_SOURCE.md` | Redirigir a `docs/MANGADEX.md` o reemplazar |
| `docs/TESTING.md` | Estrategia mocks MangaDex |
| `docs/SECURITY.md` | **Nuevo** — app auth + RLS opcional |
| `docs/PHASES.md` | Fases A–G |
| `AGENTS.md` | Enlace a este plan |
| `README.md` / `SETUP.md` | Rutas `[mangaId]`, sin `db:seed` de mangas mock |
| `.env.example` | MangaDex |
| `.cursor/rules/main.mdc` | Rutas y stack |
| `src/lib/swagger.ts` | Schemas uuid, rutas renombradas |

---

## 10. Plan de pruebas

### 10.1 Unit tests (Jest)

| Suite | Qué probar |
|-------|------------|
| `mangadex/mappers.test.ts` | title localized, status map, genres from tags, cover URL |
| `mangadex/locale.test.ts` | fallback en/es |
| `mangadex/tags.test.ts` | resolución Action → UUID |
| `validations.test.ts` | uuid válido/inválido en bookmark/history |

**Fixtures:** JSON guardado en `tests/fixtures/mangadex/` (respuestas reales anonimizadas, sin depender de red).

### 10.2 Integration tests (API routes)

| Suite | Enfoque |
|-------|---------|
| `api/manga/search.test.ts` | Mock `fetch` MangaDex → shape `{ success, data }` |
| `api/manga/bookmark.test.ts` | DB test Neon (test container o branch) + user de prueba |
| Auth | 401 sin sesión en bookmark/history |

Usar `DATABASE_URL` de branch Neon de test o Docker Postgres en CI.

### 10.3 E2E (Playwright)

| Spec | Cambio |
|------|--------|
| `basic-functionality.spec.ts` | Sin cambios mayores |
| `dashboard-loading.spec.ts` | Pre-seed bookmark con `mangaDexId` conocido; mock opcional MangaDex en CI |
| **Nuevo** `search-mangadex.spec.ts` | `/search` → Browse All → al menos 1 card con imagen MangaDex |
| **Nuevo** `manga-detail.spec.ts` | Abrir `/manga/{uuid}` → título visible |
| **Nuevo** `bookmark-flow.spec.ts` | Bookmark en detalle → aparece en dashboard |
| `auth.setup.ts` | Mantener Clerk test user |

**CI E2E:** variable `PLAYWRIGHT_MOCK_MANGADEX=true` que intercepte `api.mangadex.org` con fixtures (evitar flakiness y rate limits).

### 10.4 Contrato / regresión

- [ ] Snapshot del mapper `MangaListItem` (1 fixture)
- [ ] OpenAPI / swagger alineado con respuestas reales
- [ ] `npm run typecheck` + `lint` + `build` en CI (ya existe)

### 10.5 Manual QA (pre-release)

- [ ] Search + filtros status/género
- [ ] Detalle + lista de capítulos
- [ ] Lector carga páginas
- [ ] Bookmark add/remove + límite Basic
- [ ] Historial “continuar leyendo”
- [ ] Stripe tier sin regresión
- [ ] Email simulado con títulos resueltos

---

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Rate limit MangaDex | Cache tag list; batch requests; CDN covers en `next/image` |
| Manga eliminado en MangaDex pero bookmark existe | 404 en UI + “quitar de biblioteca” |
| E2E flaky por red | Fixtures + mock en CI |
| Migración bookmarks sin `sourceId` | Script + limpieza huérfanos |
| Lector at-home complejidad | Fase E dedicada; spike previo en OpenSpec `design.md` |
| RLS + Prisma complejidad | Postponer a Fase F; app-layer primero |

---

## 12. Criterios de aceptación (Definition of Done)

- [ ] No quedan lecturas de catálogo desde `db.manga` / `db.chapter` en rutas de producción.
- [ ] Bookmarks e historial usan UUID MangaDex en Neon.
- [ ] Rutas públicas usan `/manga/[mangaId]` con UUID.
- [ ] Documentación listada en §9 actualizada.
- [ ] Tests §10 verdes en CI.
- [ ] `docs/PHASES.md` refleja estado completado de fases A–G.
- [ ] `/post-implementation` y job `docs-coherence` pasan en PR.

---

## 13. Orden sugerido de PRs

| PR | Contenido |
|----|-----------|
| PR1 | `lib/mangadex` + tests unit + env/docs base |
| PR2 | Schema Prisma + migración + seed |
| PR3 | Search + detail API MangaDex |
| PR4 | Bookmarks + dashboard compose |
| PR5 | Reader + reading history |
| PR6 | E2E + limpieza Manga/Chapter + docs finales |
| PR7 (opcional) | RLS Neon + SECURITY.md |

---

## Referencias

- [MangaDex API docs](https://api.mangadex.org/docs/)
- [Search manga](https://api.mangadex.org/docs/03-manga/search/)
- [Covers](https://api.mangadex.org/docs/03-manga/covers/)
- Plan DX previo: `docs/DEVELOPMENT_FLOW.md`
- Modelo actual: `prisma/schema.prisma`
