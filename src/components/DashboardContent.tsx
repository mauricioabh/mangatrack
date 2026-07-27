"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CatalogCover } from "@/components/manga/catalog-cover";
import { mangaPath } from "@/lib/consumet/ids";
import { cn } from "@/lib/utils";

interface Manga {
  id: string;
  provider?: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  status: string;
  genres: string[];
  chapters: Array<{
    id: string;
    chapterNumber: number;
    title: string;
    pages: number;
  }>;
}

interface Bookmark {
  id: string;
  userId: string;
  mangaId: string;
  provider: string;
  externalMangaId: string;
  manga: Manga | null;
  createdAt: string;
  latestChapter?: {
    id?: string;
    chapterNumber: number;
    publishedAt?: string;
  } | null;
  hasUnreadLatest?: boolean;
  isReading?: boolean;
  isFinished?: boolean;
  readChapterCount?: number;
  latestReadChapterNumber?: number | null;
  totalChapters?: number | null;
  progressRatio?: number | null;
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar: string;
  tier: string;
}

function formatLatestUpdate(publishedAt?: string): string | null {
  if (!publishedAt?.trim()) return null;
  const ms = Date.parse(publishedAt);
  if (Number.isNaN(ms)) {
    return publishedAt.length > 28
      ? `${publishedAt.slice(0, 28)}…`
      : publishedAt;
  }
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNew, setFilterNew] = useState(false);
  const [filterFinished, setFilterFinished] = useState(false);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const skipNextFilterPersist = useRef(true);

  const fetchData = async () => {
    try {
      const [userResponse, bookmarksResponse, preferencesResponse] =
        await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/manga/bookmarks"),
          fetch("/api/user/preferences"),
        ]);

      const [userData, bookmarksData, preferencesData] = await Promise.all([
        userResponse.json(),
        bookmarksResponse.json(),
        preferencesResponse.json(),
      ]);

      if (userData?.success) {
        setUser(userData.user || null);
      }

      if (bookmarksData?.success) {
        setBookmarks(bookmarksData.data);
      }

      if (preferencesData?.success && preferencesData.preferences) {
        setFilterNew(Boolean(preferencesData.preferences.libraryFilterNew));
        setFilterFinished(
          Boolean(preferencesData.preferences.libraryFilterFinished)
        );
      }
      setFiltersHydrated(true);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setFiltersHydrated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (!loading) {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loading]);

  useEffect(() => {
    if (!filtersHydrated || loading) return;
    if (skipNextFilterPersist.current) {
      skipNextFilterPersist.current = false;
      return;
    }

    const persist = async () => {
      try {
        await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            libraryFilterNew: filterNew,
            libraryFilterFinished: filterFinished,
          }),
        });
      } catch (error) {
        console.error("Error persisting library filters:", error);
      }
    };

    void persist();
  }, [filterNew, filterFinished, filtersHydrated, loading]);

  const filteredBookmarks = useMemo(() => {
    if (!filterNew && !filterFinished) return bookmarks;
    return bookmarks.filter((b) => {
      const matchNew = filterNew && Boolean(b.hasUnreadLatest);
      const matchFinished = filterFinished && Boolean(b.isFinished);
      return matchNew || matchFinished;
    });
  }, [bookmarks, filterNew, filterFinished]);

  const totalCount = bookmarks.length;
  const showingCount = filteredBookmarks.length;
  const filtersActive = filterNew || filterFinished;

  const setAllFilters = () => {
    setFilterNew(false);
    setFilterFinished(false);
  };

  const toggleNew = () => {
    setFilterNew((prev) => !prev);
  };

  const toggleFinished = () => {
    setFilterFinished((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
          <div className="mb-5 flex items-center gap-2 sm:mb-6">
            <div className="h-7 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:h-8 sm:w-36" />
            <div className="h-5 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg">
                <div className="aspect-[2/3] animate-pulse bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 space-y-1.5 px-0.5">
                  <div className="h-3.5 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to MangaTrack
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please sign in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2.5 sm:mb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Library
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums"
          >
            {totalCount}
          </Badge>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5">
          <Button
            type="button"
            size="sm"
            variant={!filtersActive ? "default" : "outline"}
            className={cn(
              "rounded-full",
              !filtersActive &&
                "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            )}
            onClick={setAllFilters}
            aria-pressed={!filtersActive}
          >
            All
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterNew ? "default" : "outline"}
            className={cn(
              "rounded-full",
              filterNew && "bg-red-600 text-white hover:bg-red-700 border-0"
            )}
            onClick={toggleNew}
            aria-pressed={filterNew}
          >
            New
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterFinished ? "default" : "outline"}
            className={cn(
              "rounded-full",
              filterFinished &&
                "bg-amber-600 text-white hover:bg-amber-700 border-0"
            )}
            onClick={toggleFinished}
            aria-pressed={filterFinished}
          >
            Finished
          </Button>
        </div>

        {filtersActive && totalCount > 0 ? (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {showingCount} of {totalCount}
          </p>
        ) : null}

        {totalCount === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                No favorites yet
              </h3>
              <p className="mb-4 text-gray-500 dark:text-gray-400">
                Start exploring and add manga to your Library!
              </p>
              <Link href="/search">
                <Button className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
                  <Search className="mr-2 h-4 w-4" />
                  Discover Manga
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : showingCount === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                No manga match these filters
              </h3>
              <p className="mb-4 text-gray-500 dark:text-gray-400">
                Try All, or switch New / Finished to see more of your library.
              </p>
              <Button variant="outline" onClick={setAllFilters}>
                Show all
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBookmarks.map((bookmark) => {
              if (!bookmark.manga) return null;
              const manga = bookmark.manga;
              const latestUpdate = formatLatestUpdate(
                bookmark.latestChapter?.publishedAt
              );
              const progressPct =
                bookmark.progressRatio != null
                  ? Math.round(bookmark.progressRatio * 100)
                  : null;
              return (
                <Link
                  key={bookmark.id}
                  href={mangaPath(bookmark.provider, manga.id)}
                  className="group block overflow-hidden rounded-lg border border-blue-200/80 bg-white/70 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-blue-800/60 dark:bg-slate-900/40 dark:hover:border-blue-700"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {manga.coverImage ? (
                      <CatalogCover
                        src={manga.coverImage}
                        alt={manga.title}
                        title={manga.title}
                        width={280}
                        height={420}
                        provider={bookmark.provider}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                      {bookmark.isReading ? (
                        <Badge
                          className="border-0 bg-emerald-600/95 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm"
                          aria-label="Reading"
                        >
                          Reading
                        </Badge>
                      ) : null}
                      {bookmark.isFinished ? (
                        <Badge
                          className="border-0 bg-amber-600/95 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm"
                          aria-label="Finished"
                        >
                          Finished
                        </Badge>
                      ) : null}
                    </div>
                    {bookmark.hasUnreadLatest ? (
                      <span
                        className="absolute right-2 top-2 z-10 flex h-3 w-3 items-center justify-center"
                        title="New unread chapter"
                        aria-label="New unread chapter"
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-2 pt-8 sm:p-2.5">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-sm">
                        {manga.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] capitalize text-white/80">
                        {bookmark.latestChapter &&
                        bookmark.latestChapter.chapterNumber > 0
                          ? `Ch. ${bookmark.latestChapter.chapterNumber} · ${bookmark.provider}`
                          : bookmark.provider}
                      </p>
                      {latestUpdate ? (
                        <p className="mt-0.5 truncate text-[11px] text-white/70">
                          Updated {latestUpdate}
                        </p>
                      ) : null}
                      {progressPct != null ? (
                        <div
                          className="mt-1.5"
                          role="progressbar"
                          aria-valuenow={progressPct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Reading progress ${progressPct}%`}
                        >
                          <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
                            <div
                              className="h-full rounded-full bg-emerald-400 transition-[width] duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
