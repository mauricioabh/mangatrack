---
name: /ship
description: Verifica, commitea y abre PR con los cambios actuales
category: workflow
---

# /ship — Verificar y publicar cambios

## 1. Estado

```powershell
git status
git diff
```

## 2. Calidad

```powershell
npm run typecheck
npm run lint
```

Opcional si hubo cambios en app/rutas: `npm run build`  
Opcional: `npm run test:e2e`

## 3. Rama

```powershell
git checkout -b feat/<nombre>
```

Tipos: `feat/`, `fix/`, `db/`, `docs/`, `ci/`

## 4. Commit

```powershell
git add .
git commit -m "tipo(scope): descripción"
```

Ver `.cursor/rules/Convenciones-de-Git.mdc`.

## 5. Push y PR

```powershell
git push -u origin HEAD
```

Crear PR con GitHub MCP o `gh pr create` — base `main` o `dev` según el repo.

## Notas

- PowerShell: usar `;` no `&&`
- Correr `/post-implementation` antes si fue una feature grande
