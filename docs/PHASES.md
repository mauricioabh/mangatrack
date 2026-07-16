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

## Fase 2 — Catálogo Consumet (cutover) ✅

- [x] Cliente `src/lib/consumet` + env `CONSUMET_*`
- [x] Schema Neon provider-scoped + wipe legacy MangaDex IDs
- [x] BFF search/detail/reader multi-provider
- [x] UI provider-labeled search + rutas `/manga/[provider]/[id]`
- [x] Cover proxy `/api/catalog/cover` + badge chapter-count en search
- [x] Poll diario Inngest; webhook MangaDex → 410
- [x] Tests Jest `tests/consumet/*` (mappers + ids)

Plan histórico (superseded): `docs/MANGADEX_MIGRATION_PLAN.md`

## Fase 3 — Notificaciones automáticas

- [x] Detectar capítulos nuevos vía poll Consumet (watermark en favorites)
- [x] Disparar email + in-app + push según preferencias
- [ ] Tests de integración Resend (sandbox)
- [ ] “Check now” / cadencia configurable (opcional)

## Fase 4 — MSW y desarrollo offline

- [ ] Restaurar `src/mocks/` (handlers + data)
- [ ] Flag para dev sin Neon

## Fase 5 — Producción

- [ ] Webhooks Clerk/Stripe en prod
- [ ] Variables Vercel completas
- [ ] Sentry en runtime (si se reactiva SDK)
