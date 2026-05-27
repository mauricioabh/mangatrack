# Tech Stack — MangaTrack

## Frontend

- **Next.js 15** — App Router, Turbopack en dev/build
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (Radix)
- **Framer Motion** — animaciones
- **next-themes** — dark/light

## Backend

- **Next.js API Routes** — `src/app/api/`
- **Prisma 6** + **PostgreSQL (Neon)**
- **Zod** — validación en `src/lib/validations.ts`
- **Clerk** — auth (`@clerk/nextjs`, `src/middleware.ts`)
- **Stripe** — suscripciones premium (`src/lib/stripe.ts`, webhooks)
- **Resend** — emails (`src/lib/email.ts`)

## Testing

- **Playwright** — E2E (`tests/`, `@clerk/testing`)
- **Jest** — unit (config en package.json)

## Observabilidad / DX

- **Sentry** — MCP de proyecto en `.cursor/mcp.json`
- **Swagger** — `/api-docs`, `src/lib/swagger.ts`

## Deploy

- **Vercel** (target) — ver `vercel.json`
- Variables: ver `docs/ENV.md`

## Fuente de contenido (pendiente)

- **MangaFeeling** — previsto vía scraping; no integrado aún

## Comandos npm

| Script        | Uso                    |
| ------------- | ---------------------- |
| `npm run dev` | Desarrollo             |
| `npm run build` | Build producción     |
| `npm run typecheck` | `tsc --noEmit`   |
| `npm run lint` | ESLint                |
| `npm run db:push` | Sync schema dev    |
| `npm run db:migrate` | Migraciones formales |
| `npm run db:sync` | Alinear schema Neon |
| `npm run db:cleanup-catalog` | Quitar tablas legacy `mangas`/`chapters` |
| `npm run test:e2e` | Playwright         |
