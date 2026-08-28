## Why

MangaTrack comparte el ecosistema Wayool (Watchily, Passward) pero arrastra deuda de DX y observabilidad: `process.env` suelto con `SKIP_ENV_VALIDATION` en build, sin pre-commit formatting, Jest sin correr en CI, sin rate limiting en APIs Consumet-heavy, sin analytics producto, UI monolingüe, y fetch manual sin URL state en search/browse. Endurecer el stack alinea calidad, seguridad y UX con los otros productos sin tocar las capas de cache del reader/library ya optimizadas.

## What Changes

- **PR1 — `@t3-oss/env-nextjs`:** `src/env.ts` tipado; eliminar `SKIP_ENV_VALIDATION` de build y CI; migrar ~25 lecturas de `process.env`.
- **PR2 — Husky + lint-staged + Prettier:** Mismo patrón que watchily-ho (`prepare`, pre-commit, `.prettierrc`).
- **PR3 — Jest → Vitest:** Migrar 7 suites unitarias; añadir `npm test` a CI; mantener Playwright e2e intacto.
- **PR4 — `@upstash/ratelimit`:** Límites en APIs sensibles (search, browse, cover proxy, chapter-count, stripe checkout, user delete); degradación graceful sin Upstash; **NO** Redis para cache.
- **PR5 — PostHog:** Mismo project que WAT/PWD; super property `app: 'man'` en todos los eventos; pageviews + eventos producto clave.
- **PR6a — next-intl infra:** `[locale]` con `localePrefix: 'as-needed'` (`en` sin prefix, `es` → `/es/...`); middleware intl + Clerk encadenado.
- **PR6b — next-intl strings:** Extracción UI es/en (dashboard, search, browse, reader chrome, settings, auth shell).
- **PR7a — TanStack Query:** Provider + migrar dashboard bookmarks/profile/preferences; conservar `library-cache.ts` como `initialData`.
- **PR7b — nuqs search:** `q`, status, genre, match, providers, page en URL.
- **PR7c — nuqs browse:** `mode`, `period` en URL.

**Non-goals (explícitos):**

- Redis/KV para cache de catálogo, reader, covers o library.
- Tocar consumet in-process Map TTL, `cover-fallback.ts`, `library-cache.ts`, headers `Cache-Control` existentes.
- Cambios de schema Prisma, Stripe pricing, o fuente Consumet.

## Capabilities

### New Capabilities

- `env-validation`: Validación tipada de variables de entorno en build y runtime; build falla si faltan vars requeridas en prod.
- `developer-toolchain`: Pre-commit (Husky/lint-staged/Prettier), Vitest en CI, scripts de test unificados.
- `api-rate-limiting`: Rate limits Upstash en rutas sensibles con respuesta 429 y degradación sin credenciales.
- `product-analytics`: PostHog con tag `app: man` en todos los eventos del producto.
- `i18n-locale`: UI bilingüe es/en con routing App Router y selector de idioma.
- `client-data-layer`: TanStack Query para datos async del dashboard; nuqs para estado de filtros en URL (search, browse).

### Modified Capabilities

- `search-pagination`: Deep links y persistencia de filtros en query string (nuqs); ampliar `q` param contract.
- `browse-feeds`: Mode y period persistidos en URL; rutas localizadas bajo `[locale]`.

## Impact

- **Código:** `src/env.ts` (nuevo), `src/middleware.ts`, `src/app/[locale]/` (reestructura rutas), `src/lib/rate-limit.ts`, providers PostHog/Query, ~30 API routes (rate limit selectivo), componentes search/dashboard/browse/settings.
- **Deps nuevas:** `@t3-oss/env-nextjs`, husky, lint-staged, prettier, vitest, `@upstash/ratelimit`, `@upstash/redis`, posthog-js, next-intl, nuqs, `@tanstack/react-query`.
- **Deps removidas:** jest, ts-jest, `@testing-library/*` (sin uso).
- **Env:** `UPSTASH_REDIS_REST_*`, `NEXT_PUBLIC_POSTHOG_*` (ver design.md); resto validado vía t3.
- **Docs:** `.env.example`, `docs/ENV.md`, `docs/TESTING.md`, `docs/TECH_STACK.md`.
- **Android:** Deep links y paths Clerk pueden requerir actualización en `docs/MOBILE_ANDROID.md` tras i18n.
- **Riesgos:** PR6 (i18n) es el más invasivo; middleware chain; commit masivo Prettier; rate limit en search+chapter-count.
