import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { buildChapterPushContent } from "@/lib/push/chapter-notification";
import { chunkTokens } from "@/lib/push/chunk-tokens";
import { buildChapterMulticastMessage } from "@/lib/push/fcm-multicast";
import {
  getFavoriteUserIdsForManga,
  notifyFavoriteUsersInAppAndEmail,
} from "@/lib/push/notify-favorite-users";
import { readerPath } from "@/lib/consumet/ids";

/**
 * Optional manual / internal event for chapter notify.
 * Primary path is daily poll (`poll-favorite-chapters-daily`).
 */
export const chapterPublishedPush = inngest.createFunction(
  {
    id: "manga-chapter-published-push",
    name: "Push notify users on new chapter",
    triggers: [{ event: "manga/chapter.published" }],
  },
  async ({ event, step }) => {
    const {
      provider,
      manga_id,
      chapter_id,
      chapter_title,
      chapter_number,
    } = event.data as {
      provider: string;
      manga_id: string;
      chapter_id: string;
      chapter_title?: string;
      chapter_number?: number;
    };

    if (!provider || !manga_id || !chapter_id) {
      return { error: "provider, manga_id, and chapter_id are required" };
    }

    const userIds = await step.run("get-favorite-user-ids", async () =>
      getFavoriteUserIdsForManga(provider, manga_id)
    );

    if (userIds.length === 0) {
      return { notifiedUsers: 0, tokensSent: 0, batches: 0, inApp: 0 };
    }

    const inAppResult = await step.run("notify-in-app-and-email", async () =>
      notifyFavoriteUsersInAppAndEmail({
        userIds,
        provider,
        externalMangaId: manga_id,
        externalChapterId: chapter_id,
        chapterTitle: chapter_title,
        chapterNumber: chapter_number,
      })
    );

    const tokens = await step.run("get-push-tokens", async () => {
      const rows = await db.userPushToken.findMany({
        where: { userId: { in: userIds } },
        select: { token: true },
      });
      return [...new Set(rows.map((r) => r.token))];
    });

    if (tokens.length === 0) {
      return {
        notifiedUsers: userIds.length,
        tokensSent: 0,
        batches: 0,
        inApp: inAppResult.inApp,
      };
    }

    const pushContent = await buildChapterPushContent({
      provider,
      externalMangaId: manga_id,
      externalChapterId: chapter_id,
      chapterTitle: chapter_title,
      chapterNumber: chapter_number,
    });

    if (!pushContent) {
      return {
        notifiedUsers: userIds.length,
        tokensSent: 0,
        batches: 0,
        inApp: inAppResult.inApp,
        error: "Could not resolve chapter for push payload",
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const readerUrl = `${appUrl}${readerPath(provider, chapter_id)}`;
    const batches = chunkTokens(tokens);
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await step.run(`fcm-send-batch-${i}`, async () => {
        const messaging = getFirebaseMessaging();
        return messaging.sendEachForMulticast(
          buildChapterMulticastMessage({
            tokens: batch,
            title: pushContent.title,
            body: pushContent.body,
            url: readerUrl,
            provider,
            externalMangaId: pushContent.externalMangaId,
            externalChapterId: pushContent.externalChapterId,
          })
        );
      });

      successCount += result.successCount;
      failureCount += result.failureCount;
    }

    return {
      notifiedUsers: userIds.length,
      tokensSent: tokens.length,
      batches: batches.length,
      successCount,
      failureCount,
      inApp: inAppResult.inApp,
    };
  }
);
