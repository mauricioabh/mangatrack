import { env } from "@/env";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { getLatestChapterUpdate, getMangaInfo } from "@/lib/consumet";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { buildChapterPushContent } from "@/lib/push/chapter-notification";
import { chunkTokens } from "@/lib/push/chunk-tokens";
import { notifyFavoriteUsersInAppAndEmail } from "@/lib/push/notify-favorite-users";
import { readerPath } from "@/lib/consumet/ids";

const CONCURRENCY = 3;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
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
    () => worker(),
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
      }),
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

          // Same latest resolution as library/dashboard badges (not chapters[0]).
          const latest = getLatestChapterUpdate(info.chapters);
          if (!latest.chapterId) {
            return { status: "empty" as const, favoriteId: fav.id };
          }

          const newest =
            info.chapters.find((c) => c.id === latest.chapterId) ?? null;
          const externalChapterId = latest.chapterId;
          const chapterTitle = newest?.title;
          const chapterNumber = newest?.chapterNumber ?? latest.chapterNumber;

          if (
            fav.lastNotifiedChapterId &&
            fav.lastNotifiedChapterId === externalChapterId
          ) {
            return { status: "unchanged" as const, favoriteId: fav.id };
          }

          // First poll: seed watermark without notifying flood
          if (!fav.lastNotifiedChapterId) {
            await db.userFavorite.update({
              where: { id: fav.id },
              data: { lastNotifiedChapterId: externalChapterId },
            });
            return { status: "seeded" as const, favoriteId: fav.id };
          }

          await notifyFavoriteUsersInAppAndEmail({
            userIds: [fav.userId],
            provider: fav.provider,
            externalMangaId: fav.externalMangaId,
            externalChapterId,
            chapterTitle,
            chapterNumber,
          });

          const pushContent = await buildChapterPushContent({
            provider: fav.provider,
            externalMangaId: fav.externalMangaId,
            externalChapterId,
            chapterTitle,
            chapterNumber,
          });

          if (pushContent) {
            const tokens = await db.userPushToken.findMany({
              where: { userId: fav.userId },
              select: { token: true },
            });
            const unique = [...new Set(tokens.map((t) => t.token))];
            if (unique.length > 0) {
              const appUrl = env.NEXT_PUBLIC_APP_URL;
              const url = `${appUrl}${readerPath(
                fav.provider,
                externalChapterId,
              )}`;
              const messaging = getFirebaseMessaging();
              for (const batch of chunkTokens(unique)) {
                await messaging.sendEachForMulticast({
                  tokens: batch,
                  notification: {
                    title: pushContent.title,
                    body: pushContent.body,
                  },
                  data: {
                    provider: fav.provider,
                    externalMangaId: fav.externalMangaId,
                    externalChapterId,
                    url,
                  },
                });
              }
            }
          }

          await db.userFavorite.update({
            where: { id: fav.id },
            data: { lastNotifiedChapterId: externalChapterId },
          });

          return { status: "notified" as const, favoriteId: fav.id };
        } catch (error) {
          console.error(
            `Poll failed for favorite ${fav.id} (${fav.provider}/${fav.externalMangaId}):`,
            error,
          );
          return {
            status: "error" as const,
            favoriteId: fav.id,
            message: error instanceof Error ? error.message : "unknown",
          };
        }
      }),
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
  },
);
