---
name: /post-implementation
description: Checklist de cierre después de implementar cualquier cambio
category: workflow
---

# /post-implementation — Checklist de cierre

## 1. Documentación

| Si cambió... | Actualizar... |
|--------------|---------------|
| `prisma/schema.prisma` | `docs/DATA_MODEL.md` |
| `src/app/api/` (contrato) | `README.md` / `SETUP.md` |
| `.env.example` | `docs/ENV.md` |
| Ingest / MangaFeeling | `docs/MANGA_SOURCE.md` |
| `openspec/changes/` | `docs/PHASES.md` |
| `package.json` deps | `docs/TECH_STACK.md` |
| Nuevo command | `docs/CONTRIBUTING.md` |

## 2. Calidad

```powershell
npm run typecheck
npm run lint
```

## 3. Build (si rutas/layout/config)

```powershell
npm run build
```

## 4. Residuos

- Sin `console.log` de debug
- Sin secretos en código

## 5. Ship / OpenSpec

- `/ship` para commit y PR
- Si aplica: `/opsx-archive`
