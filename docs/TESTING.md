# Testing — MangaTrack

## Estado actual

**Validación manual** del flujo Consumet (búsqueda multi-provider, detalle, lector, bookmarks, badges de capítulos). Jest unitarios cubren mappers/ids de `src/lib/consumet`.

Checklist sugerido:

1. `npm run dev` → `/search` → buscar (ej. `one piece`) y ver provider + badge **N caps**
2. Abrir `/manga/[provider]/[mangaId]` → bookmark / quitar (Basic: límite 50)
3. Abrir capítulo en `/reader/[provider]/[chapterId]`
4. Dashboard con bookmarks enriquecidos desde Consumet (no MangaDex)
5. (Opcional) Cron de notificaciones — ver sección Inngest abajo

## Unit (Jest)

```powershell
npm test
npm run test:watch
```

Suites relevantes:

| Archivo | Qué cubre |
| ------- | --------- |
| `tests/consumet/mappers.test.ts` | `mapStatus`, search/detail/chapter/pages, neighbors, proxy paths |
| `tests/consumet/ids.test.ts` | encode `~` para chapter ids con `/`, rutas app/API |
| `tests/reading-progress.test.ts` | orden y “continue reading” |
| `tests/push/fcm-multicast.test.ts` | FCM data-only multicast (sin `notification`) |

Push FCM (Android PWA): ver `docs/FIREBASE_SETUP.md` §5–6. Manual preferido en preview/prod; script `scripts/test-fcm-send.ts`.

## E2E (Playwright)

Ver `tests/README.md`. Opcional mientras la prioridad sea manual.

```powershell
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

## Inngest — poll diario de capítulos

Función: `poll-favorite-chapters-daily` (cron `0 2 * * *`).

**Local:**

1. `npm run dev` (ya setea `INNGEST_DEV=1`)
2. En otra terminal: `npx inngest-cli@latest dev`
3. Abrí http://localhost:8288 → **Functions** → *Poll Consumet for new chapters on favorites* → **Invoke**
4. En **Runs** deberías ver `COMPLETED` con output tipo `{ favorites, notified, seeded, errors }`

Notas:

- Primera corrida sobre un favorite sin `lastNotifiedChapterId` → `seeded` (no notifica flood).
- Para forzar notificación: en Neon bajá `lastNotifiedChapterId` a un capítulo viejo y volvé a Invocar.
- `/api/webhook/mangadex` responde **410** (ya no es el path de notificaciones).

**Prod:** `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` en Vercel; dashboard en app.inngest.com.

## Antes de PR

```powershell
npm run typecheck
npm run lint
npm run build
npm test
```

## CI

GitHub Actions: typecheck, lint, build (`.github/workflows/ci.yml`).
