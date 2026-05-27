-- Idempotent cleanup after MangaDex migration (catalog no longer in Neon).
-- Safe to run if tables were already dropped by `prisma db push`.

DROP TABLE IF EXISTS "chapters" CASCADE;
DROP TABLE IF EXISTS "mangas" CASCADE;
