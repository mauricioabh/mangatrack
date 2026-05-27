---
name: /fix
description: Diagnostica y corrige un bug de manera sistemática
category: workflow
---

# /fix — Corregir un bug

## 1. Entender

- Error, capa (UI, API, lib, Prisma, Clerk, Stripe, email)

## 2. Reproducir

```powershell
npm run dev
npm run typecheck
npm run lint
```

## 3. Corregir

- Cambio mínimo; sin refactor innecesario

## 4. Verificar

```powershell
npm run typecheck
npm run lint
```

## 5. Commit

```powershell
git commit -m "fix(scope): descripción"
```

Actualizar docs si el fix cambia contrato API o env.
