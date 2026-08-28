# Testing — MangaTrack

## Estado actual

**Validación manual** del flujo Consumet (búsqueda multi-provider, detalle, lector, bookmarks, badges de capítulos). Vitest unitarios cubren mappers/ids de `src/lib/consumet`.

Checklist sugerido:

1. `npm run dev` → `/search` → buscar (ej. `one piece` / `"demon slayer"`) y ver provider + badge **N caps**; probar Exact phrase y chips de providers
2. Abrir `/manga/[provider]/[mangaId]` → bookmark / quitar (Basic: límite 50)
3. Abrir capítulo en `/reader/[provider]/[chapterId]`
4. Dashboard con bookmarks enriquecidos desde Consumet (no MangaDex)
5. (Opcional) Cron de notificaciones — ver sección Inngest abajo
6. i18n: `/es/dashboard`, Settings → Preferences → language switcher
7. URL state: copiar link de search/browse con filtros

## Unit (Vitest)

```powershell
npm test
npm run test:watch
```

Suites relevantes:

| Archivo | Qué cubre |
| ------- | --------- |
| `tests/consumet/mappers.test.ts` | `mapStatus`, search/detail/chapter/pages, neighbors, proxy paths |
| `tests/consumet/search-relevance.test.ts` | Ranking, exact phrase, providers intersect |
| `tests/consumet/ids.test.ts` | encode `~` para chapter ids con `/`, rutas app/API |
| `tests/reading-progress.test.ts` | orden y “continue reading” |
| `tests/rate-limit.test.ts` | Upstash search limit (skip si no hay credenciales) |

## E2E (Playwright)

Ver `tests/README.md`. Requiere dev server en `:3000`, `.env.test` con `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`, y `npx playwright install` la primera vez.

```powershell
npm run dev
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

Cobertura relevante post-i18n:

| Spec | Qué valida |
| ---- | ---------- |
| `dashboard-loading.spec.ts` | Dashboard carga; APIs protegidas responden `application/json` |
| `i18n.spec.ts` | Switcher en Settings → Preferences; `/es/dashboard` con textos ES |
| `basic-functionality.spec.ts` | Homepage y redirects sin sesión |

## Inngest — poll diario de capítulos

Función: `poll-favorite-chapters-daily` (cron `0 2 * * *`).

**Local:**

1. `npm run dev` (ya setea `INNGEST_DEV=1`)
2. En otra terminal: `npx inngest-cli@latest dev`
3. Abrí http://localhost:8288 → **Functions** → *Poll Consumet for new chapters on favorites* → **Invoke**
4. En **Runs** deberías ver `COMPLETED` con output tipo `{ favorites, notified, seeded, errors }`

Notas:

- Primera corrida sobre un favorite sin `lastNotifiedChapterId` → `seeded` (no notifica flood).
- El “capítulo más nuevo” se resuelve con `getLatestChapterUpdate` (alineado con dashboard), no con el primer ítem de la lista.
- Para forzar notificación: en Neon bajá `lastNotifiedChapterId` a un capítulo viejo y volvé a Invocar.
- `/api/webhook/mangadex` responde **410** (ya no es el path de notificaciones).

**Prod:** `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` en Vercel; dashboard en app.inngest.com.

## Antes de PR

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## CI

GitHub Actions: typecheck, lint, unit tests, prettier check, build (`.github/workflows/ci.yml`).

Pre-commit local: Husky ejecuta ESLint + Prettier en archivos staged.
