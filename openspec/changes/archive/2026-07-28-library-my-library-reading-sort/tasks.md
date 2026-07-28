## 1. Schema and preferences API

- [x] 1.1 Add `libraryFilterReading` (Boolean default false) and `librarySort` (String default `updated_desc`) on Prisma `User`
- [x] 1.2 Push schema to Neon (`npm run db:push` or project equivalent) and regenerate client
- [x] 1.3 Extend `userPreferencesSchema` + GET/PATCH `/api/user/preferences` for Reading + sort
- [x] 1.4 Update `docs/DATA_MODEL.md` for the new User fields

## 2. Library UI — layout and Reading chip

- [x] 2.1 Rename heading to **My Library**; move quick search to title row trailing edge
- [x] 2.2 Move chips to second row (leading); add **Reading** chip (`isReading && !isFinished`); All clears New/Reading/Finished; OR union for active chips
- [x] 2.3 Hydrate and persist `libraryFilterReading` with existing filter prefs effect

## 3. Sort control

- [x] 3.1 Add Sort control on chips row trailing edge: `updated_desc` (default), `updated_asc`, `title_asc`, `title_desc`
- [x] 3.2 Apply client sort after chip + quick-search filters; Updated uses `latestChapter.publishedAt` with `createdAt` fallback; title uses localeCompare
- [x] 3.3 Hydrate and persist `librarySort` via preferences

## 4. Verify

- [x] 4.1 Run `npm run typecheck` and `npm run lint` on touched files
- [x] 4.2 Manual smoke: layout, Reading excludes Finished, sort orders, prefs survive reload
