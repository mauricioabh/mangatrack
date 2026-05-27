import { db } from "@/lib/db";
import { sendNotificationEmail, NotificationEmailData } from "@/lib/email";
import { NotificationType } from "@prisma/client";
import { getMangaDetail } from "@/lib/mangadex";

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  mangaId?: string;
  chapterId?: string;
}

async function resolveMangaChapterTitles(
  mangaDexId?: string,
  chapterDexId?: string
): Promise<{ mangaTitle?: string; chapterTitle?: string }> {
  if (!mangaDexId) return {};

  try {
    const detail = await getMangaDetail(mangaDexId);
    if (!detail) return {};

    let chapterTitle: string | undefined;
    if (chapterDexId) {
      const ch = detail.chapters.find((c) => c.id === chapterDexId);
      chapterTitle = ch?.title;
    }

    return { mangaTitle: detail.title, chapterTitle };
  } catch {
    return {};
  }
}

export async function createNotificationWithEmail(
  data: CreateNotificationData
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailNotifications: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const { mangaTitle, chapterTitle } = await resolveMangaChapterTitles(
      data.mangaId,
      data.chapterId
    );

    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        mangaDexId: data.mangaId,
        chapterDexId: data.chapterId,
      },
    });

    if (user.emailNotifications && user.email) {
      const emailData: NotificationEmailData = {
        userName: user.name || "Manga Reader",
        notificationTitle: data.title,
        notificationMessage: data.message,
        mangaTitle,
        chapterTitle,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      };

      const emailResult = await sendNotificationEmail(user.email, emailData);

      if (!emailResult.success) {
        console.error("Failed to send notification email:", emailResult.error);
      }
    }

    return { success: true, notificationId: notification.id };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createNewChapterNotification(
  userId: string,
  mangaDexId: string,
  chapterDexId: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const detail = await getMangaDetail(mangaDexId);
  if (!detail) {
    return { success: false, error: "Manga not found" };
  }

  const chapter = detail.chapters.find((c) => c.id === chapterDexId);
  if (!chapter) {
    return { success: false, error: "Chapter not found" };
  }

  return createNotificationWithEmail({
    userId,
    type: "NEW_CHAPTER",
    title: "New Chapter Available!",
    message: `${detail.title} ${chapter.title} is now available to read.`,
    mangaId: mangaDexId,
    chapterId: chapterDexId,
  });
}

export async function createMangaUpdateNotification(
  userId: string,
  mangaDexId: string,
  updateMessage: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const detail = await getMangaDetail(mangaDexId);
  if (!detail) {
    return { success: false, error: "Manga not found" };
  }

  return createNotificationWithEmail({
    userId,
    type: "MANGA_UPDATE",
    title: "Manga Update",
    message: `${detail.title}: ${updateMessage}`,
    mangaId: mangaDexId,
  });
}

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  return createNotificationWithEmail({
    userId,
    type: "SYSTEM",
    title,
    message,
  });
}

export async function getUserNotificationPreferences(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { emailNotifications: true },
  });

  return user?.emailNotifications ?? true;
}

export async function updateEmailNotificationPreference(
  userId: string,
  emailNotifications: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.user.update({
      where: { id: userId },
      data: { emailNotifications },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating email notification preference:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
