import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { getMangaInfo } from "@/lib/consumet";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { buildChapterPushContent } from "@/lib/push/chapter-notification";
import { chunkTokens } from "@/lib/push/chunk-tokens";
import { buildChapterMulticastMessage } from "@/lib/push/fcm-multicast";
import { notifyFavoriteUsersInAppAndEmail } from "@/lib/push/notify-favorite-users";
import { readerPath } from "@/lib/consumet/ids";

const CONCURRENCY = 3;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export const pollFavoriteChapters = inngest.createFunction(
  {
    id: "poll-favorite-chapters-daily",
    name: "Poll Consumet for new chapters on favorites",
    triggers: [{ cron: "0 2 * * *" }],
  },
  async ({ step }) => {
    const favorites = await step.run("load-favorites", async () =>
      db.userFavorite.findMany({
        select: {
          id: true,
          userId: true,
          provider: true,
          externalMangaId: true,
          lastNotifiedChapterId: true,
        },
      })
    );

    if (favorites.length === 0) {
      return { favorites: 0, notified: 0, errors: 0 };
    }

    const outcomes = await step.run("poll-each-favorite", async () =>
      mapPool(favorites, CONCURRENCY, async (fav) => {
        try {
          const info = await getMangaInfo(fav.provider, fav.externalMangaId);
          if (!info || info.chapters.length === 0) {
            return { status: "empty" as const, favoriteId: fav.id };
          }

          // Chapters from scrapers are typically newest-first
          const newest = info.chapters[0];
          if (
            fav.lastNotifiedChapterId &&
            fav.lastNotifiedChapterId === newest.id
          ) {
            return { status: "unchanged" as const, favoriteId: fav.id };
          }

          // First poll: seed watermark without notifying flood
          if (!fav.lastNotifiedChapterId) {
            await db.userFavorite.update({
              where: { id: fav.id },
              data: { lastNotifiedChapterId: newest.id },
            });
            return { status: "seeded" as const, favoriteId: fav.id };
          }

          await notifyFavoriteUsersInAppAndEmail({
            userIds: [fav.userId],
            provider: fav.provider,
            externalMangaId: fav.externalMangaId,
            externalChapterId: newest.id,
            chapterTitle: newest.title,
            chapterNumber: newest.chapterNumber,
          });

          const pushContent = await buildChapterPushContent({
            provider: fav.provider,
            externalMangaId: fav.externalMangaId,
            externalChapterId: newest.id,
            chapterTitle: newest.title,
            chapterNumber: newest.chapterNumber,
          });

          if (pushContent) {
            const tokens = await db.userPushToken.findMany({
              where: { userId: fav.userId },
              select: { token: true },
            });
            const unique = [...new Set(tokens.map((t) => t.token))];
            if (unique.length > 0) {
              const appUrl =
                process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
              const url = `${appUrl}${readerPath(
                fav.provider,
                newest.id
              )}`;
              const messaging = getFirebaseMessaging();
              for (const batch of chunkTokens(unique)) {
                await messaging.sendEachForMulticast(
                  buildChapterMulticastMessage({
                    tokens: batch,
                    title: pushContent.title,
                    body: pushContent.body,
                    url,
                    provider: fav.provider,
                    externalMangaId: fav.externalMangaId,
                    externalChapterId: newest.id,
                  })
                );
              }
            }
          }

          await db.userFavorite.update({
            where: { id: fav.id },
            data: { lastNotifiedChapterId: newest.id },
          });

          return { status: "notified" as const, favoriteId: fav.id };
        } catch (error) {
          console.error(
            `Poll failed for favorite ${fav.id} (${fav.provider}/${fav.externalMangaId}):`,
            error
          );
          return {
            status: "error" as const,
            favoriteId: fav.id,
            message: error instanceof Error ? error.message : "unknown",
          };
        }
      })
    );

    const notified = outcomes.filter((o) => o.status === "notified").length;
    const errors = outcomes.filter((o) => o.status === "error").length;
    const seeded = outcomes.filter((o) => o.status === "seeded").length;

    return {
      favorites: favorites.length,
      notified,
      seeded,
      errors,
    };
  }
);
