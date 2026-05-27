# PRD — MangaTrack

> Fuente de verdad del producto.

## Problema

Los lectores de manga quieren **seguir series**, **retomar donde dejaron** y **enterarse de capítulos nuevos** sin perder el hilo entre dispositivos.

## Usuarios objetivo

- Lectores ocasionales (tier Basic: bookmarks limitados)
- Lectores frecuentes (tier Premium: bookmarks ilimitados + features premium)

## MVP — Alcance actual

### Implementado

1. **Autenticación** — Clerk (OAuth + email)
2. **Biblioteca** — búsqueda, detalle manga, bookmarks con límites por tier
3. **Lector** — capítulos con páginas desde BD
4. **Historial de lectura** — progreso por capítulo
5. **Notificaciones** — in-app, browser, email (Resend)
6. **Premium** — Stripe checkout + portal + webhooks
7. **Dev tools** — simulación de emails y notificaciones

### Pendiente / planificado

1. **Ingest MangaFeeling** — sincronizar catálogo y capítulos reales
2. **Notificaciones automáticas** — al detectar capítulo nuevo en ingest
3. **MSW / mocks** — desarrollo sin BD (carpeta `src/mocks/`)

## Stack

Ver `docs/TECH_STACK.md`.

## Criterios de éxito

- Usuario autenticado puede buscar, marcar favorito, leer y retomar capítulo
- Upgrade a Premium desbloquea límites vía Stripe
- Emails de nuevo capítulo llegan si el usuario tiene preferencia activa

## Riesgos

- **Contenido externo:** scraping/ToS del sitio fuente — ver `docs/MANGA_SOURCE.md`
- **Datos mock:** producción requiere ingest real o CMS propio
- **Serverless + scraping:** ingest puede requerir cron/job fuera de Vercel si Playwright es necesario
