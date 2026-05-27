# Fases de desarrollo — MangaTrack

## Fase 0 — DX y documentación ✅ (esta entrega)

- [x] `AGENTS.md` + carpeta `docs/`
- [x] `.cursor/rules`, `commands`, `skills`, `hooks`
- [x] OpenSpec `config.yaml` + skills opsx
- [x] CI + PR template + docs-coherence

## Fase 1 — Calidad y CI operativo

- [ ] Verificar CI en GitHub (typecheck, lint, build)
- [ ] Añadir job Playwright opcional en CI (secrets Clerk)
- [ ] Unificar referencias `.env.example` en README/SETUP

## Fase 2 — Catálogo MangaDex (ver plan maestro)

Plan detallado: **`docs/MANGADEX_MIGRATION_PLAN.md`**

- [ ] Fase A: `src/lib/mangadex` + tests unitarios
- [ ] Fase B: Schema Neon (bookmarks por `mangaDexId`, sin tablas Manga/Chapter)
- [ ] Fase C–E: BFF search/detail/reader + bookmarks compose
- [ ] Fase F (opcional): RLS Neon — `docs/SECURITY.md`
- [ ] Fase G: Limpieza docs, E2E, deprecar MangaFeeling

## Fase 3 — Notificaciones automáticas

- [ ] Detectar capítulos nuevos post-ingest
- [ ] Disparar email + in-app + browser según preferencias
- [ ] Tests de integración Resend (sandbox)

## Fase 4 — MSW y desarrollo offline

- [ ] Restaurar `src/mocks/` (handlers + data)
- [ ] Flag para dev sin Neon

## Fase 5 — Producción

- [ ] Webhooks Clerk/Stripe en prod
- [ ] Variables Vercel completas
- [ ] Sentry en runtime (si se reactiva SDK)
