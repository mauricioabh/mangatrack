import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { chapterReadSchema } from "@/lib/validations";
import { getMangaChapters } from "@/lib/mangadex";

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

    const existingHistory = await db.readingHistory.findUnique({
      where: {
        userId_chapterDexId: {
          userId: user.id,
          chapterDexId: validatedData.chapterId,
        },
      },
    });

    if (existingHistory) {
      await db.readingHistory.update({
        where: { id: existingHistory.id },
        data: { readAt: new Date() },
      });
    } else {
      await db.readingHistory.create({
        data: {
          userId: user.id,
          mangaDexId: validatedData.mangaId,
          chapterDexId: validatedData.chapterId,
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

    const where: { userId: string; mangaDexId?: string } = {
      userId: user.id,
    };

    if (mangaId) {
      where.mangaDexId = mangaId;
    }

    const history = await db.readingHistory.findMany({
      where,
      orderBy: { readAt: "desc" },
    });

    if (!mangaId || history.length === 0) {
      return NextResponse.json({
        success: true,
        data: history,
      });
    }

    const chapters = await getMangaChapters(mangaId);
    const chapterNumById = new Map(
      chapters.map((c) => [c.id, c.chapterNumber])
    );

    const data = history.map((h) => ({
      ...h,
      chapterNumber: chapterNumById.get(h.chapterDexId) ?? null,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reading history" },
      { status: 500 }
    );
  }
}
