import { db } from "@/lib/db";
import { buildChapterPushContent } from "@/lib/push/chapter-notification";
import { createNotificationWithEmail } from "@/lib/notifications";

export async function notifyFavoriteUsersInAppAndEmail(
  userIds: string[],
  mangaDexId: string,
  chapter: Record<string, unknown>,
  translatedLanguage: string
): Promise<{ inApp: number; emailsAttempted: number; errors: number }> {
  if (userIds.length === 0) {
    return { inApp: 0, emailsAttempted: 0, errors: 0 };
  }

  const pushContent = await buildChapterPushContent(
    mangaDexId,
    chapter,
    translatedLanguage
  );

  if (!pushContent) {
    return { inApp: 0, emailsAttempted: 0, errors: userIds.length };
  }

  const title = "New chapter available";
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
      mangaId: pushContent.mangaDexId,
      chapterId: pushContent.chapterDexId,
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
  mangaDexId: string
): Promise<string[]> {
  const favorites = await db.userFavorite.findMany({
    where: { mangaDexId },
    select: { userId: true },
  });
  return [...new Set(favorites.map((f) => f.userId))];
}
