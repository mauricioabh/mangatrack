---
name: /db-migration
description: Aplica cambios de schema Prisma de manera segura
category: database
---

# /db-migration — Cambio de schema Prisma

## Antes

1. `prisma/schema.prisma`
2. `docs/DATA_MODEL.md`
3. Aprobación si es destructivo

## Desarrollo

```powershell
# Editar schema
npm run db:push
npm run db:generate
```

## Formal

```powershell
npm run db:migrate
```

## Después

```powershell
npm run typecheck
```

Actualizar `docs/DATA_MODEL.md`.

```powershell
git commit -m "db: descripción"
```
