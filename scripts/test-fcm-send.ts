/**
 * One-off: send a real chapter-style FCM + in-app using the user's first favorite.
 * Usage: $env:DATABASE_URL="..."; npx dotenv -e .env.local -- npx tsx scripts/test-fcm-send.ts
 */
import { PrismaClient } from "@prisma/client";
import { getMangaInfo } from "../src/lib/consumet";
import { readerPath } from "../src/lib/consumet/ids";
import { getFirebaseMessaging } from "../src/lib/firebase-admin";
import { buildChapterPushContent } from "../src/lib/push/chapter-notification";
import { buildChapterMulticastMessage } from "../src/lib/push/fcm-multicast";
import { createNotificationWithEmail } from "../src/lib/notifications";

async function main() {
  const db = new PrismaClient();
  try {
    const toks = await db.userPushToken.findMany({
      select: { token: true, userId: true, platform: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    console.log(
      JSON.stringify({
        count: toks.length,
        platforms: toks.map((t) => t.platform),
        updatedAt: toks.map((t) => t.updatedAt.toISOString()),
      })
    );
    if (toks.length === 0) {
      console.error("No push tokens");
      process.exit(1);
    }

    const fav = await db.userFavorite.findFirst();
    if (!fav) {
      console.error("No favorites");
      process.exit(1);
    }

    const info = await getMangaInfo(fav.provider, fav.externalMangaId);
    if (!info || info.chapters.length === 0) {
      console.error("Could not load manga chapters from Consumet");
      process.exit(1);
    }

    const newest = info.chapters[0];
    const pushContent = await buildChapterPushContent({
      provider: fav.provider,
      externalMangaId: fav.externalMangaId,
      externalChapterId: newest.id,
      chapterTitle: newest.title,
      chapterNumber: newest.chapterNumber,
    });
    if (!pushContent) {
      console.error("Could not build push content");
      process.exit(1);
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://mangatrack.wayool.com";
    const url = `${appUrl}${readerPath(fav.provider, newest.id)}`;

    console.log(
      JSON.stringify({
        manga: info.title,
        chapterId: newest.id,
        pushTitle: pushContent.title,
        pushBody: pushContent.body,
        url,
      })
    );

    const messaging = getFirebaseMessaging();
    const tokens = [...new Set(toks.map((t) => t.token))];
    const res = await messaging.sendEachForMulticast(
      buildChapterMulticastMessage({
        tokens,
        title: pushContent.title,
        body: pushContent.body,
        url,
        provider: fav.provider,
        externalMangaId: fav.externalMangaId,
        externalChapterId: newest.id,
      })
    );

    const errors = res.responses
      .map((r, i) =>
        r.success
          ? null
          : {
              index: i,
              code: r.error?.code,
              message: r.error?.message,
            }
      )
      .filter(Boolean);

    console.log(
      JSON.stringify({
        successCount: res.successCount,
        failureCount: res.failureCount,
        messageIds: res.responses.map((r) => r.messageId ?? null),
        errors,
      })
    );

    const userIds = [...new Set(toks.map((t) => t.userId))];
    for (const userId of userIds) {
      await createNotificationWithEmail({
        userId,
        type: "NEW_CHAPTER",
        title: pushContent.title,
        message: pushContent.body,
        provider: fav.provider,
        mangaId: fav.externalMangaId,
        chapterId: newest.id,
      });
    }
    console.log(JSON.stringify({ inAppUsers: userIds.length }));
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
