import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { buildChapterPushContent } from "@/lib/push/chapter-notification";
import { chunkTokens } from "@/lib/push/chunk-tokens";
import {
  getFavoriteUserIdsForManga,
  notifyFavoriteUsersInAppAndEmail,
} from "@/lib/push/notify-favorite-users";

export const chapterPublishedPush = inngest.createFunction(
  {
    id: "manga-chapter-published-push",
    name: "Push notify users on new chapter",
    triggers: [{ event: "manga/chapter.published" }],
  },
  async ({ event, step }) => {
    const { manga_id, chapter, translatedLanguage } = event.data;

    const userIds = await step.run("get-favorite-user-ids", async () =>
      getFavoriteUserIdsForManga(manga_id)
    );

    if (userIds.length === 0) {
      return { notifiedUsers: 0, tokensSent: 0, batches: 0, inApp: 0 };
    }

    const inAppResult = await step.run("notify-in-app-and-email", async () =>
      notifyFavoriteUsersInAppAndEmail(
        userIds,
        manga_id,
        chapter,
        translatedLanguage
      )
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

    const pushContent = await buildChapterPushContent(
      manga_id,
      chapter,
      translatedLanguage
    );

    if (!pushContent) {
      return {
        notifiedUsers: userIds.length,
        tokensSent: 0,
        batches: 0,
        inApp: inAppResult.inApp,
        error: "Could not resolve chapter id for push payload",
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const readerUrl = `${appUrl}/reader/${pushContent.chapterDexId}`;
    const batches = chunkTokens(tokens);
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await step.run(`fcm-send-batch-${i}`, async () => {
        const messaging = getFirebaseMessaging();
        return messaging.sendEachForMulticast({
          tokens: batch,
          notification: {
            title: pushContent.title,
            body: pushContent.body,
          },
          data: {
            mangaDexId: pushContent.mangaDexId,
            chapterDexId: pushContent.chapterDexId,
            translatedLanguage,
            url: readerUrl,
          },
        });
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
