import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildChapterPageProxyPaths,
  getChapterReaderPayload,
  MangaDexError,
} from "@/lib/mangadex";

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

    const payload = await getChapterReaderPayload(chapterId);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    const proxyPages = buildChapterPageProxyPaths(
      chapterId,
      payload.chapter.pages.length
    );

    return NextResponse.json({
      success: true,
      chapter: { ...payload.chapter, pages: proxyPages },
      manga: { id: payload.manga.id, title: payload.manga.title },
      chapters: payload.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        pages: [] as string[],
      })),
    });
  } catch (error) {
    if (error instanceof MangaDexError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status === 404 ? 404 : 502 }
      );
    }
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}
