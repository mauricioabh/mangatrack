## Context

Estado actual (ver explore previo): `SKIP_ENV_VALIDATION=1` en build/CI sin `@t3-oss/env`; eslint only; Jest (7 suites) no en CI; Playwright e2e separado; ~25 archivos con `process.env` suelto; search lee solo `?q=` al mount; library usa fetch manual + `library-cache.ts`; UI 100% inglés; sin PostHog ni rate limit.

Referencia implementable: **watchily-ho** (Husky, Prettier, Upstash rate-limit, Vitest), **passward** (Vitest + mismo dolor env).

## Goals / Non-Goals

**Goals:**

- Build production-ready sin `SKIP_ENV_VALIDATION`.
- DX alineada con WAT (pre-commit, format, unit tests en CI).
- Protección abuse en APIs costosas (Upstash solo rate limit).
- Analytics producto unificado Wayool (`app: man`).
- UI es/en con URLs compartibles.
- Search/browse con estado en URL; dashboard con Query dedupe/refetch sin romper library-cache.

**Non-Goals:**

- Cache Redis/KV (consumet TTL, cover-fallback, library-cache, Cache-Control — intocables).
- Rate limit en reader page proxy (`/api/chapters/.../pages/...`) — volumen legítimo alto.
- Webhooks (Clerk/Stripe/Inngest) — tienen propia verificación.
- Traducir metadatos Consumet (solo UI app).

## Decisions

### D1 — Orden de PRs (merge secuencial recomendado)

```
PR1 env → PR2 husky ∥ PR3 vitest → PR4 ratelimit → PR5 posthog
  → PR7a tanstack → PR7b nuqs search → PR7c nuqs browse
  → PR6a i18n infra → PR6b i18n strings
```

**Rationale:** i18n al final evita mover rutas dos veces (nuqs/search primero en paths actuales; luego `[locale]` wrap). PR2/PR3 paralelos tras PR1.

### D2 — `@t3-oss/env-nextjs`

- Un `src/env.ts`: `server` + `client` schemas Zod.
- Clasificación vars: **required prod** (DATABASE_URL, Clerk, Stripe, NEXT_PUBLIC_APP_URL, Consumet base), **optional** (Sentry, Firebase, Resend, Inngest, Upstash, PostHog), **test** (TEST_USER_*, PLAYWRIGHT_TEST).
- CI: placeholders completos → quitar `SKIP_ENV_VALIDATION`.
- Vitest setup: `skipValidation: true` o `.env.test` con dummies.

### D3 — Rate limit (patrón WAT)

`src/lib/rate-limit.ts` — lazy init, `null` sin credenciales, prefix `mangatrack:*`.

| Ruta | Key | Límite |
|------|-----|--------|
| `GET /api/manga/search` | userId | 20/min sliding |
| `GET /api/manga/chapter-count` | userId | 60/min |
| `GET /api/browse` | userId | 30/min |
| `GET /api/catalog/cover` | userId | 120/min |
| `POST /api/stripe/create-checkout` | userId | 5/min |
| `POST /api/user/delete` | userId | 3/h |

Helper por route (no middleware global) — testeable, granular.

### D4 — PostHog

- `posthog-js` + provider en layout client boundary.
- `posthog.register({ app: 'man' })` al init — **obligatorio en todo evento**.
- `identify(clerkUserId)` post-auth; `reset()` on sign-out.
- Eventos MVP: `search_performed`, `bookmark_added`, `bookmark_removed`, `chapter_opened`, `premium_checkout_started`, `push_enabled`.
- No capturar query literal en search (privacy) — solo length bucket + provider count.
- No-op si falta `NEXT_PUBLIC_POSTHOG_KEY`.

### D5 — next-intl

- **`localePrefix: 'as-needed'`** — `en` default sin `/en/`; `es` → `/es/dashboard`, etc.
- Estructura: `src/app/[locale]/layout.tsx` + mover páginas actuales.
- Middleware: `createMiddleware(routing)` **antes** de `clerkMiddleware` (detect locale → protect routes).
- Messages: `messages/en.json`, `messages/es.json`.
- Language switcher en settings + header (persist cookie `NEXT_LOCALE`).
- Clerk redirect URLs: mantener paths sin locale prefix para `en`; documentar `/es/sign-in` para ES.
- SEO: `hreflang` en metadata; sitemap actualizado.

**Alternativa descartada:** cookie-only sin prefix — peor SEO y deep links.

### D6 — TanStack Query + library-cache

- `QueryClientProvider` en layout client.
- Dashboard queries: `['bookmarks']`, `['profile']`, `['preferences']`.
- **`initialData` / `placeholderData` desde `readLibraryCache()`** — sessionStorage sigue siendo SWR instant paint.
- Invalidar queries en bookmark add/remove (reader, detail) + `invalidateLibraryCache()`.
- No duplicar TTL server — Query `staleTime` ~90s alineado con `LIBRARY_FOCUS_THROTTLE_MS`.

### D7 — nuqs

- Search: `q`, `status`, `genre`, `match`, `providers`, `page` — reemplaza bootstrap manual `window.location.search`.
- Browse: `mode`, `period`.
- Library filters: **permanecen server-persisted** (Neon) — no nuqs (decisión: evitar conflicto con cross-device prefs).

### D8 — Prettier / Husky (copiar WAT)

```json
// .prettierrc
{ "semi": true, "singleQuote": false, "trailingComma": "all", "tabWidth": 2 }
```

lint-staged: `*.{ts,tsx}` → `eslint --fix` + `prettier --write`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Build CI falla sin env placeholders | PR1 amplía CI env antes de quitar SKIP |
| Prettier diff masivo | PR2 commit dedicado solo format |
| Rate limit rompe search UX (chapter-count N+1) | Límite chapter-count más alto (60/min) |
| i18n rompe Clerk middleware / Android | PR6a con e2e smoke `/es/dashboard`; doc MOBILE_ANDROID |
| Query vs library-cache doble fuente | Query usa cache como initialData; doc en code comment |
| PostHog bundle size | Lazy init; optional en dev |

## Migration Plan

1. Merge PR1–PR5 + PR7 en `dev` branch; validar preview Vercel.
2. PR6a (infra i18n) — smoke EN unchanged, ES routes work.
3. PR6b (strings) — QA bilingüe completo.
4. Promote `dev` → `main` tras checklist de verificación (tasks §10).
5. **Rollback:** rate limit y PostHog son no-op sin env; i18n rollback = revert PR6; env validation rollback = restaurar SKIP (último recurso).

## Cuándo probar (gate final)

**Puedes hacer QA completo del bundle cuando:**

- Todos los tasks de `tasks.md` §1–§10 estén `[x]`.
- CI verde: typecheck + lint + **vitest** + build.
- Preview Vercel de `dev` desplegado con env de preview configurados (ver abajo).
- Opcional: Playwright e2e local si tocaste middleware/rutas.

**No hace falta esperar** para probar parcialmente tras cada PR mergeado a `dev` — ver tabla incremental en tasks §11.

## Configuración requerida de tu parte (post-merge)

### Local (`.env.local`)

Añadir/confirmar tras PR1 (validación activa):

```env
# Ya existentes — deben estar completas o build falla
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONSUMET_BASE_URL=https://consumet.wayool.com
# Stripe, Sentry, Firebase, Resend según features que uses localmente

# NUEVAS — PR4 rate limit (opcional local; sin ellas = no-op)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# NUEVAS — PR5 PostHog (opcional local; copiar del project WAT/PWD)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Tras `npm ci`, Husky se instala vía `prepare` (PR2).

### Vercel — Preview (`dev` branch)

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Neon rama **dev** |
| Clerk keys | `pk_test_` / `sk_test_` |
| `UPSTASH_REDIS_REST_URL` | Misma instancia Upstash Wayool (prefix `mangatrack:*`) |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST de esa DB |
| `NEXT_PUBLIC_POSTHOG_KEY` | Key del project compartido WAT/PWD |
| `NEXT_PUBLIC_POSTHOG_HOST` | Host del project (ej. `https://us.i.posthog.com`) |

**Redeploy** preview tras añadir vars.

### Vercel — Production (`main`)

Mismas vars nuevas con credenciales prod. Upstash recomendado en prod para rate limit real.

### PostHog dashboard

Filtrar eventos: `app = man`. Verificar que WAT (`app: wat`) y PWD no se mezclan.

### Upstash

Si ya tienes Redis para Watchily: **reutilizar instancia**, prefixes distintos (`watchily:*` vs `mangatrack:*`). No crear DB nueva salvo aislamiento explícito.

### i18n QA manual

1. `/dashboard` — inglés default.
2. `/es/dashboard` — UI en español.
3. Language switcher en settings persiste tras reload.
4. `/es/search?q=one+piece` — búsqueda + filtros en URL.
5. Clerk sign-in funciona en `/sign-in` y `/es/sign-in`.

## Open Questions

- (Ninguna bloqueante.) Traducción ES: ¿tono informal (tú) o neutral? → Default informal, consistente con WAT.
