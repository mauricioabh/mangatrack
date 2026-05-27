# Testing — MangaTrack

## Estado actual

**Validación manual** mientras se estabiliza el flujo MangaDex (búsqueda, detalle, lector, bookmarks).

Checklist sugerido:

1. `npm run dev` → `/search` → buscar y abrir un manga
2. Bookmark / quitar bookmark (usuario Basic: límite 50)
3. Abrir capítulo en `/reader/[chapterId]`
4. Dashboard con bookmarks enriquecidos desde MangaDex

## Unit (Jest)

Disponible cuando quieras retomarlo; no es requisito mientras pruebes a mano.

```powershell
npm test
npm run test:watch
```

## E2E (Playwright)

Ver `tests/README.md`. También opcional por ahora.

```powershell
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

## Antes de PR

```powershell
npm run typecheck
npm run lint
npm run build
```

## CI

GitHub Actions: typecheck, lint, build (`.github/workflows/ci.yml`).
