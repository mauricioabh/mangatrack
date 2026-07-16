-- Pre-cutover wipe (legacy MangaDex columns still present).
DELETE FROM "user_favorites";
DELETE FROM "reading_history";
DELETE FROM "notifications"
WHERE "type" IN ('NEW_CHAPTER', 'MANGA_UPDATE')
   OR "mangaDexId" IS NOT NULL;
