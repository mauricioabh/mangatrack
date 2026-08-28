import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildChapterPageProxyPaths,
  ConsumetError,
  decodeExternalId,
  getChapterPages,
  getChapterReaderPayload,
  getMangaInfo,
  inferMangaIdFromChapterId,
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
  const fields = request.nextUrl.searchParams.get("fields");

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const providerKey = provider.toLowerCase();

    // Fast path: page list only (do not wait on manga info / chapter catalog)
    if (fields === "pages") {
      const pages = await getChapterPages(providerKey, chapterId);
      if (pages.length === 0) {
        return NextResponse.json(
          { success: false, error: "Chapter not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        chapter: {
          id: chapterId,
          title: "",
          chapterNumber: 0,
          pages: buildChapterPageProxyPaths(
            providerKey,
            chapterId,
            pages.length,
          ),
        },
      });
    }

    // Meta path: manga + chapter list for chrome / neighbors (no page scrape)
    if (fields === "meta") {
      const resolvedMangaId =
        mangaId?.trim() || inferMangaIdFromChapterId(providerKey, chapterId);

      if (!resolvedMangaId) {
        return NextResponse.json(
          {
            success: false,
            error: "mangaId is required when chapter id has no manga prefix",
          },
          { status: 400 },
        );
      }

      const detail = await getMangaInfo(providerKey, resolvedMangaId);
      if (!detail) {
        return NextResponse.json(
          { success: false, error: "Chapter not found" },
          { status: 404 },
        );
      }

      const listed = detail.chapters.find((c) => c.id === chapterId);

      return NextResponse.json({
        success: true,
        chapter: {
          id: chapterId,
          title:
            listed?.title ?? `Chapter ${listed?.chapterNumber ?? ""}`.trim(),
          chapterNumber: listed?.chapterNumber ?? 0,
        },
        manga: {
          id: detail.id,
          title: detail.title,
          provider: detail.provider,
        },
        chapters: detail.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          chapterNumber: ch.chapterNumber,
          pages: [] as string[],
        })),
      });
    }

    const payload = await getChapterReaderPayload(
      providerKey,
      chapterId,
      mangaId ?? undefined,
    );

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 },
      );
    }

    const pages = buildChapterPageProxyPaths(
      providerKey,
      chapterId,
      payload.chapter.pages.length,
    );

    return NextResponse.json({
      success: true,
      chapter: { ...payload.chapter, pages },
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
        {
          status: error.status === 404 ? 404 : error.status === 400 ? 400 : 502,
        },
      );
    }
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapter" },
      { status: 500 },
    );
  }
}
