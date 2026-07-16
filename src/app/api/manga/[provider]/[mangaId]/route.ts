import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ConsumetError, getMangaInfo } from "@/lib/consumet";

interface MangaRouteProps {
  params: Promise<{
    provider: string;
    mangaId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: MangaRouteProps) {
  const { provider, mangaId: rawId } = await params;
  const mangaId = decodeURIComponent(rawId);

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const manga = await getMangaInfo(provider.toLowerCase(), mangaId);

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
    if (error instanceof ConsumetError) {
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
