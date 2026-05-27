import { PrismaClient } from "@prisma/client";

const mangaDexId = process.argv[2] ?? "96ae166c-d8e1-4e9e-88cb-805b65154d7e";

const db = new PrismaClient();

async function main() {
  const favorites = await db.userFavorite.findMany({
    where: { mangaDexId },
    select: { userId: true },
  });
  console.log(JSON.stringify({ mangaDexId, favoriteCount: favorites.length, userIds: favorites.map((f) => f.userId) }));
}

main()
  .finally(() => db.$disconnect());
