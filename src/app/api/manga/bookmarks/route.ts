import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMangaInfo } from "@/lib/consumet";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const [bookmarks, total] = await Promise.all([
      db.userFavorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.userFavorite.count({
        where: { userId: user.id },
      }),
    ]);

    const hydrated = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let manga = null;
        try {
          const detail = await getMangaInfo(
            bookmark.provider,
            bookmark.externalMangaId
          );
          if (detail) {
            manga = {
              id: detail.id,
              provider: detail.provider,
              title: detail.title,
              author: detail.author ?? "",
              description: detail.description ?? "",
              coverImage: detail.coverImage ?? "",
              coverReferer: detail.coverReferer,
              status: detail.status,
              genres: detail.genres,
              chapters: [],
            };
          }
        } catch {
          manga = {
            id: bookmark.externalMangaId,
            provider: bookmark.provider,
            title: bookmark.externalMangaId,
            author: "",
            description: "",
            coverImage: "",
            status: "ONGOING" as const,
            genres: [] as string[],
            chapters: [],
            degraded: true,
          };
        }

        return {
          id: bookmark.id,
          userId: bookmark.userId,
          provider: bookmark.provider,
          mangaId: bookmark.externalMangaId,
          externalMangaId: bookmark.externalMangaId,
          createdAt: bookmark.createdAt,
          manga,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: hydrated,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
