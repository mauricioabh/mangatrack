import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMangaDetail, MangaDexError } from "@/lib/mangadex";

interface MangaRouteProps {
  params: Promise<{
    mangaId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: MangaRouteProps) {
  const { mangaId } = await params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const manga = await getMangaDetail(mangaId);

    if (!manga) {
      return NextResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: manga,
    });

    response.headers.set("Cache-Control", "public, max-age=300");
    return response;
  } catch (error) {
    if (error instanceof MangaDexError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status === 404 ? 404 : 502 }
      );
    }
    console.error("Error fetching manga:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch manga" },
      { status: 500 }
    );
  }
}
