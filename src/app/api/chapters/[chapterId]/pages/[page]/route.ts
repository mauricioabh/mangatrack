import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getChapterPageUrls, MangaDexError } from "@/lib/mangadex";

interface PageRouteProps {
  params: Promise<{
    chapterId: string;
    page: string;
  }>;
}

export async function GET(request: NextRequest, { params }: PageRouteProps) {
  const { chapterId, page } = await params;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pageIndex = Number.parseInt(page, 10);
    if (!Number.isFinite(pageIndex) || pageIndex < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid page index" },
        { status: 400 }
      );
    }

    const urls = await getChapterPageUrls(chapterId);
    const imageUrl = urls[pageIndex];
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    const imageRes = await fetch(imageUrl, {
      headers: { Referer: "https://mangadex.org/" },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to load page image" },
        { status: imageRes.status === 404 ? 404 : 502 }
      );
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const body = await imageRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof MangaDexError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status === 404 ? 404 : 502 }
      );
    }
    console.error("Error proxying chapter page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load page" },
      { status: 500 }
    );
  }
}
