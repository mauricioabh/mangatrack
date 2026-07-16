import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildChapterPageProxyPaths,
  ConsumetError,
  decodeExternalId,
  getChapterReaderPayload,
} from "@/lib/consumet";

interface ChapterRouteProps {
  params: Promise<{
    provider: string;
    chapterId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: ChapterRouteProps) {
  const { provider, chapterId: rawChapterId } = await params;
  const chapterId = decodeExternalId(rawChapterId);
  const mangaId = request.nextUrl.searchParams.get("mangaId") ?? undefined;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await getChapterReaderPayload(
      provider.toLowerCase(),
      chapterId,
      mangaId ?? undefined
    );

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    const proxyPages = buildChapterPageProxyPaths(
      provider.toLowerCase(),
      chapterId,
      payload.chapter.pages.length
    );

    return NextResponse.json({
      success: true,
      chapter: { ...payload.chapter, pages: proxyPages },
      manga: {
        id: payload.manga.id,
        title: payload.manga.title,
        provider: payload.manga.provider,
      },
      chapters: payload.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        pages: [] as string[],
      })),
    });
  } catch (error) {
    if (error instanceof ConsumetError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status === 404 ? 404 : error.status === 400 ? 400 : 502 }
      );
    }
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}
