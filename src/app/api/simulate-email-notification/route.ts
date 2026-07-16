import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createNewChapterNotification,
  createMangaUpdateNotification,
  createSystemNotification,
} from "@/lib/notifications";
/**
 * @swagger
 * /api/simulate-email-notification:
 *   post:
 *     summary: Simulate sending an email notification
 *     description: Send a test email notification to the current user for testing purposes
 *     tags: [Email]
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [NEW_CHAPTER, MANGA_UPDATE, SYSTEM]
 *                 description: Type of notification to simulate
 *               mangaId:
 *                 type: string
 *                 description: Manga ID (required for NEW_CHAPTER and MANGA_UPDATE)
 *               chapterId:
 *                 type: string
 *                 description: Chapter ID (required for NEW_CHAPTER)
 *     responses:
 *       200:
 *         description: Email notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 notificationId:
 *                   type: string
 *       400:
 *         description: Bad request - missing required parameters
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, mangaId, chapterId, provider } = body as {
      type?: string;
      mangaId?: string;
      chapterId?: string;
      provider?: string;
    };

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Notification type is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "NEW_CHAPTER":
        if (!provider || !mangaId || !chapterId) {
          return NextResponse.json(
            {
              success: false,
              error:
                "provider, mangaId and chapterId are required for NEW_CHAPTER",
            },
            { status: 400 }
          );
        }
        result = await createNewChapterNotification(
          user.id,
          provider,
          mangaId,
          chapterId
        );
        break;

      case "MANGA_UPDATE":
        if (!provider || !mangaId) {
          return NextResponse.json(
            {
              success: false,
              error: "provider and mangaId are required for MANGA_UPDATE",
            },
            { status: 400 }
          );
        }
        result = await createMangaUpdateNotification(
          user.id,
          provider,
          mangaId,
          "This is a simulated manga update notification for testing purposes."
        );
        break;

      case "SYSTEM":
        result = await createSystemNotification(
          user.id,
          "Test System Notification",
          "This is a simulated system notification to test email functionality."
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid notification type" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Simulated ${type} notification sent successfully!`,
        notificationId: result.notificationId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send notification",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error simulating email notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to simulate email notification" },
      { status: 500 }
    );
  }
}






