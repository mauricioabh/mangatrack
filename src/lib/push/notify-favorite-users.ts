import { db } from "@/lib/db";
import { buildChapterPushContent } from "@/lib/push/chapter-notification";
import { createNotificationWithEmail } from "@/lib/notifications";

export async function notifyFavoriteUsersInAppAndEmail(options: {
  userIds: string[];
  provider: string;
  externalMangaId: string;
  externalChapterId: string;
  chapterTitle?: string;
  chapterNumber?: number;
}): Promise<{ inApp: number; emailsAttempted: number; errors: number }> {
  const {
    userIds,
    provider,
    externalMangaId,
    externalChapterId,
    chapterTitle,
    chapterNumber,
  } = options;

  if (userIds.length === 0) {
    return { inApp: 0, emailsAttempted: 0, errors: 0 };
  }

  const pushContent = await buildChapterPushContent({
    provider,
    externalMangaId,
    externalChapterId,
    chapterTitle,
    chapterNumber,
  });

  if (!pushContent) {
    return { inApp: 0, emailsAttempted: 0, errors: userIds.length };
  }

  const title = pushContent.title;
  const message = pushContent.body;

  let inApp = 0;
  let emailsAttempted = 0;
  let errors = 0;

  for (const userId of userIds) {
    const result = await createNotificationWithEmail({
      userId,
      type: "NEW_CHAPTER",
      title,
      message,
      provider,
      mangaId: pushContent.externalMangaId,
      chapterId: pushContent.externalChapterId,
    });

    if (result.success) {
      inApp += 1;
      emailsAttempted += 1;
    } else {
      errors += 1;
    }
  }

  return { inApp, emailsAttempted, errors };
}

export async function getFavoriteUserIdsForManga(
  provider: string,
  externalMangaId: string
): Promise<string[]> {
  const favorites = await db.userFavorite.findMany({
    where: { provider, externalMangaId },
    select: { userId: true },
  });
  return [...new Set(favorites.map((f) => f.userId))];
}
