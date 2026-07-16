/**
 * Wipe favorites, reading history, and manga-linked notifications
 * before provider-scoped schema cutover.
 *
 * Usage (against the DATABASE_URL in .env.local — typically Neon `dev`):
 *   npx dotenv -e .env.local -- npx tsx scripts/wipe-provider-scoped-library.ts
 *
 * Prefer running BEFORE `prisma db push` when columns are still mangaDexId,
 * or AFTER push if columns already renamed (script adapts).
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const fav = await db.userFavorite.deleteMany({});
  const hist = await db.readingHistory.deleteMany({});

  // Prefer typed delete; fall back for mixed schema during cutover
  let notif = { count: 0 };
  try {
    notif = await db.notification.deleteMany({
      where: {
        OR: [
          { type: "NEW_CHAPTER" },
          { type: "MANGA_UPDATE" },
          { externalMangaId: { not: null } },
        ],
      },
    });
  } catch {
    notif = await db.$executeRawUnsafe(
      `DELETE FROM "notifications" WHERE "type" IN ('NEW_CHAPTER', 'MANGA_UPDATE') OR "mangaDexId" IS NOT NULL`
    ).then((count) => ({ count: Number(count) }));
  }

  console.log(
    JSON.stringify({
      favoritesDeleted: fav.count,
      historyDeleted: hist.count,
      notificationsDeleted: notif.count,
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
