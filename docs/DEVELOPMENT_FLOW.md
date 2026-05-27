# Development Flow — MangaTrack

Flujo estándar para implementar features con AI + OpenSpec.

## Vista general

```
Nuevo agente
    ├── /opsx-propose <nombre>     → proposal + design + tasks
    │       └── Revisión humana de tasks.md
    ├── /opsx-apply                → implementación con checkboxes
    ├── /post-implementation       → docs + typecheck + lint + build
    ├── /ship                      → commit + PR
    └── /opsx-archive              → archivar change
```

## Calidad

| Capa | Qué verifica |
|------|----------------|
| `.cursor/rules/Convenciones-de-codigo.mdc` | Docs a actualizar |
| `/post-implementation` | Checklist pre-commit |
| CI `docs-coherence` | schema ↔ DATA_MODEL; `.env.example` ↔ ENV.md |
| PR template | Revisión humana |

## OpenSpec

Requiere CLI instalado: `openspec --version`

```powershell
openspec new change "nombre-kebab"
openspec status --change "nombre" --json
```

Artefactos en `openspec/changes/<nombre>/`: `proposal.md`, `design.md`, `tasks.md`.

## Comandos rápidos

```powershell
npm run dev
npm run typecheck
npm run lint
npm run build
npm run db:push
npm run db:sync
npm run test:e2e
```
