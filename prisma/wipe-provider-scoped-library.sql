-- Wipe legacy MangaDex UUID-only library rows before / as part of
-- provider-scoped schema cutover (integrar-consumet-catalog).
-- Safe to run when re-pushing; also deletes provider-scoped rows if already migrated.

DELETE FROM "user_favorites";
DELETE FROM "reading_history";
DELETE FROM "notifications"
WHERE "type" IN ('NEW_CHAPTER', 'MANGA_UPDATE')
   OR "mangaDexId" IS NOT NULL
   OR "externalMangaId" IS NOT NULL;
