# Contributing — MangaTrack

## Setup

Ver `/onboarding` o `SETUP.md`.

```powershell
Copy-Item .env.example .env.local
npm install
npm run db:generate
npm run db:push
npm run db:sync
npm run dev
```

## Ramas y commits

| Rama | Uso | Vercel (típico) |
|------|-----|-----------------|
| `dev` | desarrollo diario, PRs | Preview |
| `main` | producción estable | Production |

Flujo: trabajo en `dev` → PR a `main` → merge despliega producción.

Ver `.cursor/rules/Convenciones-de-Git.mdc` — Conventional Commits, ramas `feat/`, `fix/`, `db/`, `docs/`, `ci/`.

## Comandos Cursor

| Command | Uso |
|---------|-----|
| `/onboarding` | Setup inicial |
| `/ship` | Verificar, commit, PR |
| `/fix` | Bugfix sistemático |
| `/db-migration` | Cambios Prisma |
| `/post-implementation` | Checklist pre-commit |
| `/opsx-propose` | Nuevo change OpenSpec |
| `/opsx-apply` | Implementar tasks |
| `/opsx-explore` | Exploración sin implementar |
| `/opsx-archive` | Archivar change |

## Documentación obligatoria

Tras cambios de schema, env o APIs, actualizar la tabla en `Convenciones-de-codigo.mdc`.

## MCPs recomendados (nivel usuario/proyecto)

- Neon, Clerk, Resend, Playwright, GitHub, Vercel — ver rules `*-mcp.mdc`
- Sentry — `.cursor/mcp.json` del proyecto
