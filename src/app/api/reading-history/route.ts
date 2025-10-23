import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { chapterReadSchema } from "@/lib/validations";
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
    const validatedData = chapterReadSchema.parse(body);

    // Check if already marked as read
    const existingHistory = await db.readingHistory.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: validatedData.chapterId,
        },
      },
    });

    if (existingHistory) {
      // Update the read timestamp
      await db.readingHistory.update({
        where: {
          id: existingHistory.id,
        },
        data: {
          readAt: new Date(),
        },
      });
    } else {
      // Create new reading history entry
      await db.readingHistory.create({
        data: {
          userId: user.id,
          mangaId: validatedData.mangaId,
          chapterId: validatedData.chapterId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Chapter marked as read",
    });
  } catch (error) {
    console.error("Error marking chapter as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark chapter as read" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get("mangaId");

    const where: Record<string, unknown> = {
      userId: user.id,
    };

    if (mangaId) {
      where.mangaId = mangaId;
    }

    const readingHistory = await db.readingHistory.findMany({
      where,
      include: {
        manga: true,
        chapter: true,
      },
      orderBy: {
        readAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: readingHistory,
    });
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reading history" },
      { status: 500 }
    );
  }
}
