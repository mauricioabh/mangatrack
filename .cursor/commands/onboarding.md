---
name: /onboarding
description: Setup inicial del proyecto para un nuevo desarrollador
category: setup
---

# /onboarding — Setup inicial

## 1. Dependencias

```powershell
Set-Location C:\Projects\mangatrack
npm install
```

## 2. Entorno

```powershell
Copy-Item .env.example .env.local
```

Completar: `DATABASE_URL`, Clerk, Stripe, Resend, `NEXT_PUBLIC_APP_URL`. Ver `docs/ENV.md`.

## 3. Base de datos

```powershell
npm run db:generate
npm run db:push
npm run db:sync
```

## 4. Clerk

- Dashboard → API Keys → pegar en `.env.local`
- Webhook apuntando a `/api/webhooks/clerk` (producción)
- Usuario de prueba: `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`

## 5. Desarrollo

```powershell
npm run dev
```

Abrir http://localhost:3000

## 6. Tests

```powershell
npm run test:e2e
```

## Referencias

- `AGENTS.md`, `docs/PRD.md`, `docs/CONTRIBUTING.md`, `SETUP.md`
