# MangaTrack — guía para agentes

## Documentación del proyecto

- `docs/PRD.md` — Producto, objetivo y alcance
- `docs/PHASES.md` — Fases de desarrollo (fuente de verdad de progreso)
- `docs/DEVELOPMENT_FLOW.md` — Flujo de trabajo con AI + OpenSpec (leer antes de implementar)
- `docs/ENV.md` — Variables de entorno
- `docs/DATA_MODEL.md` — Schema y modelo de datos
- `docs/TECH_STACK.md` — Stack tecnológico
- `docs/MANGADEX_MIGRATION_PLAN.md` — Plan de transición catálogo → MangaDex API
- `docs/MANGA_SOURCE.md` — Fuente legacy (MangaFeeling); ver plan MangaDex
- `docs/FIREBASE_SETUP.md` — FCM push (Firebase Console + env)
- `docs/MOBILE_ANDROID.md` — App Android nativa (`android/`)
- `docs/SECURITY.md` — Auth, Neon y RLS opcional
- `docs/CONTRIBUTING.md` — Flujo de contribución y comandos
- `docs/TESTING.md` — Estrategia de testing
- `README.md` / `SETUP.md` — Setup rápido y APIs

## Reglas Cursor

Ver `.cursor/rules/` para convenciones de código, git, DB, PowerShell, MCP y deploy.

## Comandos Cursor

Ver `.cursor/commands/` para workflows: `/ship`, `/fix`, `/db-migration`, `/onboarding`, `/post-implementation`, `/opsx-propose`, `/opsx-apply`, `/opsx-explore`, `/opsx-archive`.

## Stack (resumen)

Next.js 15 (App Router), Clerk, Prisma 6 + Neon, Stripe, Resend, Playwright, Tailwind v4 + shadcn.

## Pendiente conocido

- Catálogo vía **MangaDex API**; Neon solo guarda estado de usuario.
- Prioridad de validación: manual por ahora; Jest/Playwright siguen en el repo (`docs/TESTING.md`).
