import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ConsumetError, getMangaInfo } from "@/lib/consumet";

/**
 * Chapter count for search completeness comparison.
 * Query: ?provider=mangahere&id=one_piece
 * (query param avoids path issues with slashy Consumet ids)
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const provider = request.nextUrl.searchParams.get("provider")?.toLowerCase();
  const mangaId = request.nextUrl.searchParams.get("id");

  if (!provider || !mangaId) {
    return NextResponse.json(
      { success: false, error: "provider and id are required" },
      { status: 400 }
    );
  }

  try {
    const detail = await getMangaInfo(provider, mangaId);
    if (!detail) {
      return NextResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        provider: detail.provider,
        id: detail.id,
        title: detail.title,
        chapterCount: detail.chapters.length,
      },
    });
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=3600, stale-while-revalidate=86400"
    );
    return response;
  } catch (error) {
    if (error instanceof ConsumetError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status === 404 ? 404 : 502 }
      );
    }
    console.error("chapter-count error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve chapter count" },
      { status: 500 }
    );
  }
}
