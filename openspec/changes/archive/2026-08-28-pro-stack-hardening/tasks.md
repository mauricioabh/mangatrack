## 1. PR1 — @t3-oss/env-nextjs

- [x] 1.1 Add `@t3-oss/env-nextjs` and create `src/env.ts` (server + client Zod schemas)
- [x] 1.2 Classify all vars from `.env.example` (required prod / optional / test)
- [x] 1.3 Migrate `process.env` reads in `src/lib/*`, APIs, webhooks, Inngest, Sentry
- [x] 1.4 Remove `SKIP_ENV_VALIDATION` from `package.json` build script and CI
- [x] 1.5 Extend CI placeholder env in `.github/workflows/ci.yml` for full schema pass
- [x] 1.6 Update `.env.example` and `docs/ENV.md`
- [x] 1.7 Verify `npm run typecheck`, `npm run lint`, `npm run build` locally

## 2. PR2 — Husky + lint-staged + Prettier

- [x] 2.1 Add husky, lint-staged, prettier devDependencies; `"prepare": "husky"`
- [x] 2.2 Add `.husky/pre-commit` → `npx lint-staged`
- [x] 2.3 Add `.prettierrc` (match watchily-ho: semi, double quotes, trailingComma all)
- [x] 2.4 Configure lint-staged: `*.{ts,tsx}` → eslint --fix + prettier --write
- [x] 2.5 Run one-time Prettier format commit (isolated PR if possible)
- [x] 2.6 Optional: add `prettier --check` step to CI

## 3. PR3 — Jest → Vitest

- [x] 3.1 Remove jest, ts-jest, unused `@testing-library/*` from package.json
- [x] 3.2 Add vitest; create `vitest.config.ts` with `@/` alias
- [x] 3.3 Update scripts: `test` → `vitest run`, `test:watch` → `vitest`
- [x] 3.4 Confirm all 7 suites in `tests/**/*.test.ts` pass unchanged
- [x] 3.5 Add `npm test` step to `.github/workflows/ci.yml`
- [x] 3.6 Update `docs/TESTING.md` (Vitest, not Jest)

## 4. PR4 — @upstash/ratelimit

- [x] 4.1 Add `@upstash/ratelimit` + `@upstash/redis`
- [x] 4.2 Create `src/lib/rate-limit.ts` (lazy init, graceful no-op, prefix `mangatrack:*`)
- [x] 4.3 Apply limits: search, chapter-count, browse, catalog/cover, stripe checkout, user delete
- [x] 4.4 Return 429 + `Retry-After` on limit exceeded
- [x] 4.5 Add optional Vitest or node:test for rate-limit (skip if Upstash unset)
- [x] 4.6 Document `UPSTASH_REDIS_REST_*` in `.env.example` + `docs/ENV.md`

## 5. PR5 — PostHog

- [x] 5.1 Add posthog-js; add env vars to `src/env.ts` schema
- [x] 5.2 Create PostHog provider; `register({ app: 'man' })` on init
- [x] 5.3 Pageviews on App Router navigation; identify/reset with Clerk auth
- [x] 5.4 Capture MVP events: search_performed, bookmark_*, chapter_opened, premium_checkout_started, push_enabled
- [x] 5.5 Ensure search events never include raw query text
- [x] 5.6 Document PostHog vars in `.env.example` + `docs/ENV.md`; note shared WAT/PWD project

## 6. PR7a — TanStack Query (dashboard)

- [x] 6.1 Add `@tanstack/react-query`; QueryClientProvider in client layout boundary
- [x] 6.2 Migrate dashboard bookmarks/profile/preferences to useQuery
- [x] 6.3 Wire `readLibraryCache()` as initialData/placeholderData; keep write/invalidateLibraryCache
- [x] 6.4 Invalidate queries on bookmark mutations (detail, reader, bookmark-button)
- [x] 6.5 Set staleTime aligned with LIBRARY_FOCUS_THROTTLE_MS (~90s)

## 7. PR7b — nuqs search

- [x] 7.1 Add nuqs; NuqsAdapter in layout
- [x] 7.2 Sync search state: q, status, genre, match, providers, page
- [x] 7.3 Replace manual `window.location.search` bootstrap
- [x] 7.4 Preserve explicit-submit behavior (no search on filter-only change)
- [x] 7.5 Optional: useInfiniteQuery for search pagination

## 8. PR7c — nuqs browse

- [x] 8.1 Sync browse mode and period to URL via nuqs
- [x] 8.2 useQuery for `/api/browse` keyed by mode+period
- [x] 8.3 Default params when URL empty

## 9. PR6a — next-intl infra

- [x] 9.1 Add next-intl; create `messages/en.json`, `messages/es.json` (skeleton)
- [x] 9.2 Configure routing: locales `en`, `es`; `localePrefix: 'as-needed'`
- [x] 9.3 Restructure `src/app/` → `src/app/[locale]/` for pages
- [x] 9.4 Chain middleware: next-intl before clerkMiddleware
- [x] 9.5 Update Clerk redirect env docs for localized sign-in paths
- [x] 9.6 Add language switcher stub in settings/header
- [x] 9.7 Update SEO metadata hreflang; smoke test `/dashboard` and `/es/dashboard`

## 10. PR6b — next-intl strings

- [x] 10.1 Extract and translate dashboard, search, browse UI strings
- [x] 10.2 Extract and translate settings, auth shell, reader chrome, notifications
- [x] 10.3 Extract and translate error/empty states and toasts
- [ ] 10.4 QA pass: switch EN↔ES; verify no missing translation keys in console
- [x] 10.5 Update `docs/MOBILE_ANDROID.md` if deep link paths change

## 11. Verificación final (tu QA — gate “todo hecho”)

Ejecutar **solo cuando §1–§10 estén completos** y preview Vercel desplegado:

- [ ] 11.1 Local: `npm ci` → Husky hook installed; `npm test` + `npm run build` green
- [ ] 11.2 Local: `.env.local` completo (ver design.md); dev server — login, search, reader, bookmark
- [ ] 11.3 Local: sin Upstash/PostHog — app funciona (no-op graceful)
- [ ] 11.4 Preview Vercel: Upstash + PostHog vars set; redeploy
- [ ] 11.5 Rate limit: 21+ búsquedas rápidas → 429 en search (solo con Upstash prod/preview)
- [ ] 11.6 PostHog: eventos visibles filtrando `app = man`
- [ ] 11.7 i18n: `/es/dashboard`, `/es/search?q=…`, language switcher persiste
- [ ] 11.8 URL state: copiar link search/browse con filtros → nueva pestaña igual
- [ ] 11.9 Library: paint instantáneo con cache + refetch background (sin regresión)
- [ ] 11.10 Reader: cold open capítulo — sin regresión cache/TTL (no Redis)
- [ ] 11.11 Promote dev → main tras checklist verde

## 12. QA incremental (opcional tras cada PR en dev)

| Tras merge | Puedes probar ya |
|------------|------------------|
| PR1 | `npm run build` sin SKIP; env errors claros si falta var |
| PR2 | Pre-commit formatea; `prettier --check` |
| PR3 | `npm test` local + CI |
| PR4 | 429 en search (necesita Upstash en env) |
| PR5 | Eventos en PostHog (necesita keys) |
| PR7a–c | Dashboard refetch; URLs search/browse compartibles |
| PR6a | Rutas `/es/*` + middleware |
| PR6b | UI completa bilingüe |

## 13. Documentación post-implementación

- [x] 13.1 Update `docs/TECH_STACK.md` (Vitest, t3 env, PostHog, next-intl, nuqs, TanStack Query)
- [x] 13.2 Update `docs/TESTING.md` and `docs/CONTRIBUTING.md` (Husky, test commands)
- [ ] 13.3 Run `/post-implementation` checklist before final commit to main
