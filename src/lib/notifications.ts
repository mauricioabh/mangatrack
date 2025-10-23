import { db } from "@/lib/db";
import { sendNotificationEmail, NotificationEmailData } from "@/lib/email";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  mangaId?: string;
  chapterId?: string;
}

/**
 * Create a notification and send email if user has email notifications enabled
 */
export async function createNotificationWithEmail(
  data: CreateNotificationData
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // Get user information to check email preferences
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

    // Get manga information if mangaId is provided
    let mangaTitle: string | undefined;
    let chapterTitle: string | undefined;

    if (data.mangaId) {
      const manga = await db.manga.findUnique({
        where: { id: data.mangaId },
        select: { title: true },
      });
      mangaTitle = manga?.title;
    }

    if (data.chapterId) {
      const chapter = await db.chapter.findUnique({
        where: { id: data.chapterId },
        select: { title: true },
      });
      chapterTitle = chapter?.title;
    }

    // Create the notification in the database
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        mangaId: data.mangaId,
        chapterId: data.chapterId,
      },
    });

    // Send email if user has email notifications enabled
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
        // Don't fail the notification creation if email fails
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

/**
 * Create a notification for a new chapter
 */
export async function createNewChapterNotification(
  userId: string,
  mangaId: string,
  chapterId: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  // Get manga and chapter information
  const [manga, chapter] = await Promise.all([
    db.manga.findUnique({
      where: { id: mangaId },
      select: { title: true },
    }),
    db.chapter.findUnique({
      where: { id: chapterId },
      select: { title: true, chapterNumber: true },
    }),
  ]);

  if (!manga || !chapter) {
    return { success: false, error: "Manga or chapter not found" };
  }

  return createNotificationWithEmail({
    userId,
    type: "NEW_CHAPTER",
    title: "New Chapter Available!",
    message: `${manga.title} Chapter ${chapter.chapterNumber} is now available to read.`,
    mangaId,
    chapterId,
  });
}

/**
 * Create a notification for manga status updates
 */
export async function createMangaUpdateNotification(
  userId: string,
  mangaId: string,
  updateMessage: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const manga = await db.manga.findUnique({
    where: { id: mangaId },
    select: { title: true },
  });

  if (!manga) {
    return { success: false, error: "Manga not found" };
  }

  return createNotificationWithEmail({
    userId,
    type: "MANGA_UPDATE",
    title: "Manga Update",
    message: `${manga.title}: ${updateMessage}`,
    mangaId,
  });
}

/**
 * Create a system notification
 */
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

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      emailNotifications: true,
    },
  });

  return user?.emailNotifications ?? true;
}

/**
 * Update user's email notification preference
 */
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






