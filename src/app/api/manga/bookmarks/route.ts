import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMangaInfo, getLatestChapterUpdate } from "@/lib/consumet";

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

    // Load all favorites first: sort key (latest chapter date) comes from Consumet,
    // so DB skip/take would paginate in the wrong order.
    const [bookmarks, total] = await Promise.all([
      db.userFavorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.userFavorite.count({
        where: { userId: user.id },
      }),
    ]);

    const hydrated = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let manga = null;
        let latestChapter: {
          id?: string;
          chapterNumber: number;
          publishedAt?: string;
        } | null = null;
        let latestUpdatedAtMs: number | null = null;

        try {
          const detail = await getMangaInfo(
            bookmark.provider,
            bookmark.externalMangaId
          );
          if (detail) {
            const latest = getLatestChapterUpdate(detail.chapters);
            latestUpdatedAtMs = latest.publishedAtMs;
            if (detail.chapters.length > 0) {
              latestChapter = {
                id: latest.chapterId,
                chapterNumber: latest.chapterNumber,
                publishedAt: latest.publishedAt,
              };
            }
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
          latestChapter,
          latestUpdatedAtMs,
          manga,
        };
      })
    );

    hydrated.sort((a, b) => {
      const aMs = a.latestUpdatedAtMs ?? 0;
      const bMs = b.latestUpdatedAtMs ?? 0;
      if (bMs !== aMs) return bMs - aMs;

      // No release dates from the source: keep bookmark date as tie-breaker
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    const latestChapterIds = [
      ...new Set(
        hydrated
          .map((item) => item.latestChapter?.id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const readLatestRows =
      latestChapterIds.length > 0
        ? await db.readingHistory.findMany({
            where: {
              userId: user.id,
              externalChapterId: { in: latestChapterIds },
            },
            select: {
              provider: true,
              externalChapterId: true,
            },
          })
        : [];

    const readLatestKeys = new Set(
      readLatestRows.map(
        (row) => `${row.provider.toLowerCase()}:${row.externalChapterId}`
      )
    );

    const start = (page - 1) * limit;
    const pageData = hydrated.slice(start, start + limit).map((item) => {
      const { latestUpdatedAtMs: _sortKey, ...rest } = item;
      const latestId = item.latestChapter?.id;
      const hasUnreadLatest = Boolean(
        latestId &&
          !readLatestKeys.has(
            `${item.provider.toLowerCase()}:${latestId}`
          )
      );
      return { ...rest, hasUnreadLatest };
    });

    return NextResponse.json({
      success: true,
      data: pageData,
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
