import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface ChapterRouteProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: ChapterRouteProps) {
  const { chapterId } = await params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get chapter with manga and all chapters
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        manga: true,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Get all chapters for this manga
    const chapters = await db.chapter.findMany({
      where: {
        mangaId: chapter.mangaId,
      },
      orderBy: {
        chapterNumber: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      chapter,
      manga: chapter.manga,
      chapters,
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}
