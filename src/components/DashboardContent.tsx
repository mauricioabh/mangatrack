"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ArrowUpDown, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { CatalogCover } from "@/components/manga/catalog-cover";
import { mangaPath, readerPath } from "@/lib/consumet/ids";
import { warmChapterPages } from "@/lib/consumet/reader-warm";
import {
  getLastLibraryCacheUserId,
  isLibraryCacheFresh,
  readLibraryCache,
  shouldRefreshLibraryOnFocus,
  writeLibraryCache,
} from "@/lib/library-cache";
import { cn } from "@/lib/utils";
import type { LibrarySort } from "@/lib/validations";

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
  continueChapterId?: string | null;
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar: string;
  tier: string;
}

const LIBRARY_SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: "updated_desc", label: "Updated ↓" },
  { value: "updated_asc", label: "Updated ↑" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
];

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

function matchesQuickSearch(bookmark: Bookmark, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = bookmark.manga?.title?.toLowerCase() ?? "";
  const author = bookmark.manga?.author?.toLowerCase() ?? "";
  return title.includes(q) || author.includes(q);
}

function updatedMs(bookmark: Bookmark): number {
  const published = bookmark.latestChapter?.publishedAt;
  if (published?.trim()) {
    const ms = Date.parse(published);
    if (!Number.isNaN(ms)) return ms;
  }
  const created = Date.parse(bookmark.createdAt);
  return Number.isNaN(created) ? 0 : created;
}

function parseLibrarySort(value: unknown): LibrarySort {
  if (
    value === "updated_desc" ||
    value === "updated_asc" ||
    value === "title_asc" ||
    value === "title_desc"
  ) {
    return value;
  }
  return "updated_desc";
}

function sortBookmarks(list: Bookmark[], sort: LibrarySort): Bookmark[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (sort) {
      case "updated_desc": {
        const byUpdated = updatedMs(b) - updatedMs(a);
        if (byUpdated !== 0) return byUpdated;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }
      case "updated_asc": {
        const byUpdated = updatedMs(a) - updatedMs(b);
        if (byUpdated !== 0) return byUpdated;
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      }
      case "title_asc": {
        const titleA = a.manga?.title ?? "";
        const titleB = b.manga?.title ?? "";
        return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
      }
      case "title_desc": {
        const titleA = a.manga?.title ?? "";
        const titleB = b.manga?.title ?? "";
        return titleB.localeCompare(titleA, undefined, { sensitivity: "base" });
      }
      default: {
        const _exhaustive: never = sort;
        return _exhaustive;
      }
    }
  });
  return sorted;
}

export default function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNew, setFilterNew] = useState(false);
  const [filterReading, setFilterReading] = useState(false);
  const [filterFinished, setFilterFinished] = useState(false);
  const [librarySort, setLibrarySort] = useState<LibrarySort>("updated_desc");
  const [quickSearch, setQuickSearch] = useState("");
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const skipNextFilterPersist = useRef(true);
  const lastBookmarksFetchAt = useRef<number | null>(null);
  const fetchInFlight = useRef(false);

  const applyCachedLibrary = useCallback(() => {
    const userId = getLastLibraryCacheUserId();
    if (!userId) return false;
    const cached = readLibraryCache<Bookmark>(userId);
    if (!cached || !isLibraryCacheFresh(cached.fetchedAt)) return false;
    setUser(cached.user);
    setBookmarks(cached.bookmarks);
    lastBookmarksFetchAt.current = cached.fetchedAt;
    setLoading(false);
    return true;
  }, []);

  const fetchData = useCallback(async (options?: { background?: boolean }) => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    const background = Boolean(options?.background);
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
        lastBookmarksFetchAt.current = Date.now();
        if (userData?.success && userData.user) {
          writeLibraryCache(userData.user, bookmarksData.data);
        }
      }

      if (preferencesData?.success && preferencesData.preferences) {
        setFilterNew(Boolean(preferencesData.preferences.libraryFilterNew));
        setFilterReading(
          Boolean(preferencesData.preferences.libraryFilterReading)
        );
        setFilterFinished(
          Boolean(preferencesData.preferences.libraryFilterFinished)
        );
        setLibrarySort(parseLibrarySort(preferencesData.preferences.librarySort));
      }
      setFiltersHydrated(true);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setFiltersHydrated(true);
    } finally {
      if (!background) {
        setLoading(false);
      } else {
        setLoading(false);
      }
      fetchInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    const hadCache = applyCachedLibrary();
    void fetchData({ background: hadCache });
  }, [applyCachedLibrary, fetchData]);

  useEffect(() => {
    const handleFocus = () => {
      if (loading || fetchInFlight.current) return;
      if (!shouldRefreshLibraryOnFocus(lastBookmarksFetchAt.current)) return;
      void fetchData({ background: true });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loading, fetchData]);

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
            libraryFilterReading: filterReading,
            libraryFilterFinished: filterFinished,
            librarySort,
          }),
        });
      } catch (error) {
        console.error("Error persisting library filters:", error);
      }
    };

    void persist();
  }, [
    filterNew,
    filterReading,
    filterFinished,
    librarySort,
    filtersHydrated,
    loading,
  ]);

  const filteredBookmarks = useMemo(() => {
    const chipsActive = filterNew || filterReading || filterFinished;
    const chipFiltered = !chipsActive
      ? bookmarks
      : bookmarks.filter((b) => {
          const matchNew =
            filterNew && Boolean(b.hasUnreadLatest) && !b.isFinished;
          const matchReading =
            filterReading && Boolean(b.isReading) && !b.isFinished;
          const matchFinished = filterFinished && Boolean(b.isFinished);
          return matchNew || matchReading || matchFinished;
        });
    const searched = chipFiltered.filter((b) =>
      matchesQuickSearch(b, quickSearch)
    );
    return sortBookmarks(searched, librarySort);
  }, [
    bookmarks,
    filterNew,
    filterReading,
    filterFinished,
    quickSearch,
    librarySort,
  ]);

  const totalCount = bookmarks.length;
  const showingCount = filteredBookmarks.length;
  const filtersActive = filterNew || filterReading || filterFinished;
  const searchActive = quickSearch.trim().length > 0;
  const listConstrained = filtersActive || searchActive;

  const setAllFilters = () => {
    setFilterNew(false);
    setFilterReading(false);
    setFilterFinished(false);
  };

  const clearSearchAndFilters = () => {
    setAllFilters();
    setQuickSearch("");
  };

  const filterChips = (
    <div className="flex flex-wrap items-center gap-2">
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
        onClick={() => setFilterNew((prev) => !prev)}
        aria-pressed={filterNew}
      >
        New
      </Button>
      <Button
        type="button"
        size="sm"
        variant={filterReading ? "default" : "outline"}
        className={cn(
          "rounded-full",
          filterReading &&
            "bg-emerald-600 text-white hover:bg-emerald-700 border-0"
        )}
        onClick={() => setFilterReading((prev) => !prev)}
        aria-pressed={filterReading}
      >
        Reading
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
        onClick={() => setFilterFinished((prev) => !prev)}
        aria-pressed={filterFinished}
      >
        Finished
      </Button>
    </div>
  );

  const sortControl = (
    <Select
      value={librarySort}
      onValueChange={(value) => setLibrarySort(parseLibrarySort(value))}
    >
      <SelectTrigger
        size="sm"
        aria-label="Sort library"
        className="min-w-[8.5rem] rounded-full bg-white/80 dark:bg-slate-900/50"
      >
        <ArrowUpDown className="size-3.5 opacity-70" aria-hidden />
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent align="end">
        {LIBRARY_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:mb-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              My Library
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums"
            >
              {totalCount}
            </Badge>
            {sortControl}
          </div>
          <Input
            type="search"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Find in library…"
            aria-label="Find manga in your library"
            autoComplete="off"
            className="w-full max-w-xs bg-white/80 dark:bg-slate-900/50 sm:max-w-sm"
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mb-5">
          {filterChips}
        </div>

        {listConstrained && totalCount > 0 ? (
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
                Try All, clear your search, or switch New / Reading / Finished to
                see more of your library.
              </p>
              <Button variant="outline" onClick={clearSearchAndFilters}>
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
              const detailHref = mangaPath(bookmark.provider, manga.id);
              const primaryHref = bookmark.continueChapterId
                ? readerPath(
                    bookmark.provider,
                    bookmark.continueChapterId,
                    manga.id
                  )
                : detailHref;
              return (
                <div
                  key={bookmark.id}
                  className="group overflow-hidden rounded-lg border border-blue-200/80 bg-white/70 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-blue-800/60 dark:bg-slate-900/40 dark:hover:border-blue-700"
                >
                  <Link
                    href={primaryHref}
                    className="block"
                    onPointerDown={() => {
                      if (bookmark.continueChapterId) {
                        warmChapterPages(
                          bookmark.provider,
                          bookmark.continueChapterId,
                          manga.id
                        );
                      }
                    }}
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
                      {bookmark.hasUnreadLatest && !bookmark.isFinished ? (
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
                  <Link
                    href={detailHref}
                    className="flex min-h-10 w-full items-center justify-center border-t border-blue-200/80 bg-white/80 px-2 py-2.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-800/60 dark:bg-slate-900/60 dark:text-blue-300 dark:hover:bg-slate-800/80 sm:min-h-9 sm:py-2"
                  >
                    Details
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
