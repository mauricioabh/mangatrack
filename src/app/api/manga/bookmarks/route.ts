import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMangaInfo, getLatestChapterUpdate } from "@/lib/consumet";
import {
  deriveLibraryProgress,
  getChapterToContinue,
} from "@/lib/reading-progress";
import type { Chapter } from "@/lib/consumet";

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    // Omit limit → return the full library (hydration already loads every favorite).
    const limitParam = searchParams.get("limit");
    const limit =
      limitParam === null ? null : parseInt(limitParam, 10);

    if (
      page < 1 ||
      (limit !== null && (Number.isNaN(limit) || limit < 1 || limit > 100))
    ) {
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
        let chapters: Chapter[] = [];
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
            chapters = detail.chapters;
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
          finishedAt: bookmark.finishedAt,
          latestChapter,
          latestUpdatedAtMs,
          manga,
          _chapters: chapters,
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

    const [readLatestRows, historyRows] = await Promise.all([
      latestChapterIds.length > 0
        ? db.readingHistory.findMany({
            where: {
              userId: user.id,
              externalChapterId: { in: latestChapterIds },
            },
            select: {
              provider: true,
              externalChapterId: true,
            },
          })
        : Promise.resolve([]),
      hydrated.length > 0
        ? db.readingHistory.findMany({
            where: {
              userId: user.id,
              OR: hydrated.map((item) => ({
                provider: item.provider,
                externalMangaId: item.externalMangaId,
              })),
            },
            select: {
              provider: true,
              externalMangaId: true,
              externalChapterId: true,
              readAt: true,
            },
            orderBy: { readAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    const readLatestKeys = new Set(
      readLatestRows.map(
        (row) => `${row.provider.toLowerCase()}:${row.externalChapterId}`
      )
    );

    const historyBySeries = new Map<string, Set<string>>();
    const lastReadBySeries = new Map<string, string>();
    for (const row of historyRows) {
      const key = `${row.provider.toLowerCase()}:${row.externalMangaId}`;
      let set = historyBySeries.get(key);
      if (!set) {
        set = new Set();
        historyBySeries.set(key, set);
        // First row per series is the latest session (orderBy readAt desc)
        lastReadBySeries.set(key, row.externalChapterId);
      }
      set.add(row.externalChapterId);
    }

    const start = limit === null ? 0 : (page - 1) * limit;
    const pageItems =
      limit === null ? hydrated : hydrated.slice(start, start + limit);
    const pageData = pageItems.map((item) => {
      const chapters = item._chapters;
      const latestId = item.latestChapter?.id;
      const hasUnreadLatest = Boolean(
        !item.finishedAt &&
          latestId &&
          !readLatestKeys.has(
            `${item.provider.toLowerCase()}:${latestId}`
          )
      );
      const seriesKey = `${item.provider.toLowerCase()}:${item.externalMangaId}`;
      const readChapterIds = historyBySeries.get(seriesKey) ?? new Set<string>();
      const chapterRefs = chapters.map((c) => ({
        id: c.id,
        chapterNumber: c.chapterNumber,
      }));
      const progress = deriveLibraryProgress({
        hasHistory: readChapterIds.size > 0,
        readChapterIds,
        chapters: chapterRefs,
        totalChapters: chapters.length > 0 ? chapters.length : null,
      });
      const continueTarget = getChapterToContinue(
        chapterRefs,
        readChapterIds,
        lastReadBySeries.get(seriesKey) ?? null
      );

      return {
        id: item.id,
        userId: item.userId,
        provider: item.provider,
        mangaId: item.mangaId,
        externalMangaId: item.externalMangaId,
        createdAt: item.createdAt,
        latestChapter: item.latestChapter,
        manga: item.manga,
        hasUnreadLatest,
        isReading: progress.isReading,
        isFinished: Boolean(item.finishedAt),
        readChapterCount: progress.readChapterCount,
        latestReadChapterNumber: progress.latestReadChapterNumber,
        totalChapters: progress.totalChapters,
        progressRatio: progress.progressRatio,
        continueChapterId: continueTarget?.id ?? null,
      };
    });

    const effectiveLimit = limit ?? total;
    return NextResponse.json({
      success: true,
      data: pageData,
      pagination: {
        page: limit === null ? 1 : page,
        limit: effectiveLimit,
        total,
        pages: limit === null ? 1 : Math.ceil(total / limit),
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
