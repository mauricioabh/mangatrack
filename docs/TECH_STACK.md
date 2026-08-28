# Tech Stack — MangaTrack

## Frontend

- **Next.js 15** — App Router, Turbopack en dev/build
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (Radix)
- **Framer Motion** — animaciones
- **next-themes** — dark/light
- **PWA** — `src/app/manifest.ts` (`background_color` / `theme_color` `#0f172a`), iconos estáticos oscuros en `public/pwa/` (`npm run pwa:icons`), rutas dinámicas `/icons/[size]`, `public/sw.js`, registro en `ServiceWorkerRegister`, CTA de instalar en `PwaInstallPrompt` (`beforeinstallprompt`)

## Backend

- **Next.js API Routes** — `src/app/api/`
- **Prisma 6** + **PostgreSQL (Neon)**
- **Zod** — validación en `src/lib/validations.ts`
- **Clerk** — auth (`@clerk/nextjs`, `src/middleware.ts`)
- **Stripe** — suscripciones premium (`src/lib/stripe.ts`, webhooks)
- **Resend** — emails (`src/lib/email.ts`)
- **Inngest** — jobs (`src/inngest/`, `/api/inngest`)
- **Consumet** — catálogo BFF (`src/lib/consumet/`)

## Testing

- **Playwright** — E2E (`tests/`, `@clerk/testing`)
- **Vitest** — unit (`vitest.config.ts`, `tests/**/*.test.ts`)

## Observabilidad / DX

- **Sentry** — MCP de proyecto en `.cursor/mcp.json`
- **PostHog** — analytics producto (`app: man`), project compartido Wayool
- **@t3-oss/env-nextjs** — env tipado (`src/env.ts`)
- **Husky + lint-staged + Prettier** — pre-commit
- **Swagger** — `/api-docs`, `src/lib/swagger.ts`

## Client data / i18n

- **TanStack Query** — dashboard async data
- **nuqs** — URL state en search/browse
- **next-intl** — UI es/en (`messages/`, `[locale]` routes)
- **@upstash/ratelimit** — rate limits API (no cache Redis)

## Deploy

- **Vercel** (target) — ver `vercel.json`
- Variables: ver `docs/ENV.md`

## Fuente de contenido

- **Consumet** self-hosted (`CONSUMET_BASE_URL`) — multiprovider (`mangahere`, `mangapill`, …). Ver `docs/MANGA_SOURCE.md`.
- **Inngest** — cron diario `poll-favorite-chapters-daily` + jobs FCM.

## Comandos npm

| Script        | Uso                    |
| ------------- | ---------------------- |
| `npm run dev` | Desarrollo (`INNGEST_DEV=1`) |
| `npm run build` | Build producción     |
| `npm run typecheck` | `tsc --noEmit`   |
| `npm run lint` | ESLint                |
| `npm test` | Vitest unit             |
| `npm run db:push` | Sync schema dev    |
| `npm run db:migrate` | Migraciones formales |
| `npm run db:sync` | Alinear schema Neon |
| `npm run db:wipe-library` | Wipe favorites/historial (cutover) |
| `npm run db:cleanup-catalog` | Quitar tablas legacy `mangas`/`chapters` |
| `npm run test:e2e` | Playwright         |
