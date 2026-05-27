import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const tables = await db.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('user_favorites', 'user_push_tokens', 'user_mangas')
    ORDER BY table_name
  `;
  const fav = await db.userFavorite.count();
  const tok = await db.userPushToken.count();

  console.log("tables:", tables.map((t) => t.table_name).join(", ") || "(none)");
  console.log("user_favorites rows:", fav);
  console.log("user_push_tokens rows:", tok);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
