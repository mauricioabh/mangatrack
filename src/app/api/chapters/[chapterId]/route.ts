import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { aj } from "@/lib/arcjet";

interface ChapterRouteProps {
  params: {
    chapterId: string;
  };
}

export async function GET(request: NextRequest, { params }: ChapterRouteProps) {
  // Apply Arcjet protection
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { success: false, error: "Request blocked by security policy" },
      { status: 403 }
    );
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params before using
    const { chapterId } = await params;

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
