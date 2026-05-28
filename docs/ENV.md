# Variables de entorno — MangaTrack

Copiar `.env.example` a `.env.local` y completar los valores.

## Base de datos (Neon)

| Variable       | Descripción                          | Requerida |
| -------------- | ------------------------------------ | --------- |
| `DATABASE_URL` | Connection string de Neon PostgreSQL | ✅        |

Proyecto Neon: **mangatrack** (`wispy-surf-27556179`, región `aws-us-east-1`).

### Ramas (dev / prod)

| Rama Neon | Uso | Dónde poner `DATABASE_URL` |
| --------- | --- | -------------------------- |
| **`main`** (default) | Producción — datos reales | Vercel **Production**, `.env.production.local` |
| **`dev`** | Desarrollo y previews — copia aislada de `main` | `.env.local`, Vercel **Preview** / **Development** |

Cada rama tiene su propio host en el connection string (pooler `*.c-2.us-east-1.aws.neon.tech`). No compartas la misma URL entre local y producción si quieres evitar escribir en datos reales desde tu máquina.

Obtener URLs en [console.neon.tech](https://console.neon.tech) → proyecto **mangatrack** → **Branches** → elegir `main` o `dev` → **Connection string** (Pooled, `neondb`).

```powershell
npm run db:generate
npm run db:sync
npm run db:cleanup-catalog
```

Migraciones: aplicar primero contra la rama **`dev`** (`prisma migrate dev` o `db:push`); cuando esté validado, el mismo cambio en **`main`** (prod).

Si `npx prisma` falla con P1012, exportar `$env:DATABASE_URL="..."` o usar `.env.local` con dotenv según tu setup.

## Clerk (autenticación)

| Variable                              | Descripción                    | Requerida |
| ------------------------------------- | ------------------------------ | --------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Clave pública Clerk            | ✅        |
| `CLERK_SECRET_KEY`                    | Clave secreta Clerk            | ✅        |
| `CLERK_WEBHOOK_SECRET`                | Secret para webhook `/api/webhooks/clerk` | ✅ en prod |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | Default `/sign-in`             | ✅        |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | Default `/sign-up`             | ✅        |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Default `/dashboard`           | ✅        |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Default `/dashboard`           | ✅        |

Dashboard: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys.

### Vercel (Clerk + Neon)

| Variable | Production | Preview (rama git `dev`) |
| -------- | ---------- | ------------------------ |
| `DATABASE_URL` | Neon rama **`main`** | Neon rama **`dev`** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` | `pk_test_…` (instancia Clerk **Development**) |
| `CLERK_SECRET_KEY` | `sk_live_…` | `sk_test_…` |
| `CLERK_WEBHOOK_SECRET` | Secret del endpoint **Production** | Secret del endpoint apuntando al URL del preview |
| `NEXT_PUBLIC_APP_URL` | `https://mangatrack.wayool.com` | URL estable del deployment preview (ej. `https://mangatrack-git-dev-….vercel.app`) |

No mezclar `pk_live` con `sk_test`. Tras cambiar env en Vercel, **redeploy** el deployment afectado.

### Google OAuth (Clerk)

Clerk usa flujo **redirect** (`/v1/oauth_callback` en `*.clerk.accounts.dev` o dominio Clerk prod). Por eso basta el **URI de redirección** en Google Cloud; los **orígenes JavaScript** solo hacen falta si usas el SDK de Google en tu dominio (GIS / One Tap). Añadir `https://mangatrack.wayool.com` en origins del cliente **PROD** es recomendable, no obligatorio para el login vía Clerk.

**Android:** misma `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` en `android/local.properties` (`clerk.publishableKey`). Activar **Native API** en Clerk. La API acepta `Authorization: Bearer <JWT>` además de cookies web.

## Stripe (premium)

| Variable                         | Descripción              | Requerida |
| -------------------------------- | ------------------------ | --------- |
| `STRIPE_PUBLISHABLE_KEY`         | Clave pública Stripe     | ✅        |
| `STRIPE_SECRET_KEY`              | Clave secreta Stripe     | ✅        |
| `STRIPE_WEBHOOK_SECRET`          | Webhook `/api/webhooks/stripe` | ✅ en prod |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Price ID plan mensual   | ✅        |
| `STRIPE_PREMIUM_YEARLY_PRICE_ID`  | Price ID plan anual     | ✅        |

## Email (Resend)

| Variable         | Descripción                    | Requerida |
| ---------------- | ------------------------------ | --------- |
| `RESEND_API_KEY` | API key Resend para notificaciones | ✅ en prod |

## App

| Variable              | Descripción              | Requerida |
| --------------------- | ------------------------ | --------- |
| `NEXT_PUBLIC_APP_URL` | URL pública (emails, links) | ✅     |
| `NODE_ENV`            | `development` / `production` | ✅   |

## Inngest (jobs en segundo plano)

| Variable               | Descripción                                      | Requerida   |
| ---------------------- | ------------------------------------------------ | ----------- |
| `INNGEST_EVENT_KEY`    | Envío de eventos en producción                   | Prod        |
| `INNGEST_SIGNING_KEY`  | Verificación del endpoint `/api/inngest`         | Prod        |

| `INNGEST_DEV`          | `1` en local (usa Dev Server; no hace falta event key) | Dev ✅    |

Dev local: `npm run dev` (incluye `INNGEST_DEV=1`) + `npx inngest-cli@latest dev` → `http://localhost:3000/api/inngest`.

## Firebase (FCM push)

Guía paso a paso: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

**Cliente (web):**

| Variable | Descripción | Requerida |
| -------- | ----------- | --------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web config | Push UI |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | | Push UI |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | | Push UI |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | | Push UI |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | | Push UI |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | | Push UI |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web Push certificate (VAPID) | Push UI |

**Servidor (Inngest → FCM):**

| Variable | Descripción | Requerida |
| -------- | ----------- | --------- |
| `FIREBASE_PROJECT_ID` | Service account (o mismo que `NEXT_PUBLIC_*`) | Prod push |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Prod push |
| `FIREBASE_PRIVATE_KEY` | Private key (`\n` en env) | Prod push |

UI: Settings → **Push Notifications (FCM)**. API: `POST /api/user/push-token` (Clerk).

## MangaDex (catálogo y webhooks)

| Variable                    | Descripción                                      | Requerida |
| --------------------------- | ------------------------------------------------ | --------- |
| `MANGADEX_API_BASE_URL`     | API base (default `https://api.mangadex.org`)    | Opcional  |
| `MANGADEX_CONTENT_RATINGS`  | Ratings permitidos, CSV (ej. `safe,suggestive`)  | Opcional  |
| `MANGADEX_DEFAULT_LOCALE`   | Locale preferido para títulos (`en`, `es`, …)    | Opcional  |
| `MANGADEX_WEBHOOK_SECRET`   | Secret opcional para `/api/webhook/mangadex`       | Opcional  |

Webhook de capítulos: `POST /api/webhook/mangadex` — evento `chapter.created`; idiomas `es`, `es-la`, `en` disparan `manga/chapter.published` en Inngest.

## Testing / desarrollo

| Variable            | Descripción                          | Requerida |
| ------------------- | ------------------------------------ | --------- |
| `PLAYWRIGHT_TEST`   | `true` en CI/e2e                     | Opcional  |
| `TEST_USER_EMAIL`   | Usuario de prueba Clerk              | Dev/e2e   |
| `TEST_USER_PASSWORD`| Contraseña de prueba                 | Dev/e2e   |

## Notas

- **Nunca** commitear `.env.local` — está en `.gitignore`
- Plantilla versionada: `.env.example` (mantener sincronizado con este doc)
- CI usa placeholders (ver `.github/workflows/ci.yml`)
