-- Run once if the DB still has user_mangas from before UserFavorite migration:
-- npx dotenv -e .env.local -- prisma db execute --file prisma/rename-user-mangas-to-favorites.sql --schema prisma/schema.prisma

ALTER TABLE IF EXISTS "user_mangas" RENAME TO "user_favorites";
