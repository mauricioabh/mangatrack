import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMangaByIds } from "@/lib/mangadex";

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

    const mangaDexIds = bookmarks.map((b) => b.mangaDexId);
    const mangaList = await getMangaByIds(mangaDexIds);
    const mangaById = new Map(mangaList.map((m) => [m.id, m]));

    const data = bookmarks.map((bookmark) => {
      const manga = mangaById.get(bookmark.mangaDexId);
      return {
        id: bookmark.id,
        userId: bookmark.userId,
        mangaId: bookmark.mangaDexId,
        mangaDexId: bookmark.mangaDexId,
        createdAt: bookmark.createdAt,
        manga: manga
          ? {
              id: manga.id,
              title: manga.title,
              author: manga.author ?? "",
              description: manga.description ?? "",
              coverImage: manga.coverImage ?? "",
              status: manga.status,
              genres: manga.genres,
              chapters: [],
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data,
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
