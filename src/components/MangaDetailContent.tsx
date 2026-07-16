"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  User,
  Search,
  Play,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { CatalogCover } from "@/components/manga/catalog-cover";
import {
  getChapterToRead,
  getContinueReadingLabel,
} from "@/lib/reading-progress";

interface Manga {
  id: string;
  provider: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  coverReferer?: string;
  status: string;
  genres: string[];
  chapters: Array<{
    id: string;
    chapterNumber: number;
    title: string;
    pages: number;
    pagesData?: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  isBookmarked?: boolean;
  error?: string;
}

interface MangaDetailContentProps {
  provider: string;
  mangaId: string;
}

export default function MangaDetailContent({
  provider,
  mangaId,
}: MangaDetailContentProps) {
  const [manga, setManga] = useState<Manga | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [readChapterIds, setReadChapterIds] = useState<Set<string>>(
    () => new Set()
  );
  const [mangaLoading, setMangaLoading] = useState(true);
  const [metadataLoading, setMetadataLoading] = useState(true);

  const fetchMangaData = async () => {
    setMangaLoading(true);
    setError(null);
    try {
      const mangaResponse = await fetch(
        `/api/manga/${encodeURIComponent(provider)}/${encodeURIComponent(mangaId)}`
      );
      const mangaData = (await mangaResponse.json()) as ApiResponse<Manga>;

      if (!mangaResponse.ok) {
        setError(mangaData.error ?? "Failed to load manga details");
        return;
      }

      if (mangaData.success && mangaData.data) {
        setManga({ ...mangaData.data, provider });
        setMangaLoading(false);

        const [bookmarkResponse, historyResponse] = await Promise.all([
          fetch(
            `/api/manga/bookmark?provider=${encodeURIComponent(provider)}&mangaId=${encodeURIComponent(mangaData.data.id)}`
          ),
          fetch(
            `/api/reading-history?provider=${encodeURIComponent(provider)}&mangaId=${encodeURIComponent(mangaData.data.id)}`
          ),
        ]);

        const [bookmarkData, historyData] = await Promise.all([
          bookmarkResponse.json(),
          historyResponse.json(),
        ]);

        const bookmarkApiResponse = bookmarkData as unknown as ApiResponse<{
          isBookmarked: boolean;
        }>;
        setIsBookmarked(
          bookmarkApiResponse.success && !!bookmarkApiResponse.isBookmarked
        );

        const historyApiResponse = historyData as unknown as ApiResponse<
          Array<{ externalChapterId: string }>
        >;
        if (historyApiResponse.success && historyApiResponse.data) {
          setReadChapterIds(
            new Set(historyApiResponse.data.map((h) => h.externalChapterId))
          );
        }

        setMetadataLoading(false);
      } else {
        setError(mangaData.error ?? "Manga not found");
      }
    } catch (err) {
      setError("Failed to load manga details");
      console.error("Error fetching manga:", err);
    } finally {
      setMangaLoading(false);
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    void fetchMangaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when route ids change
  }, [provider, mangaId]);

  useEffect(() => {
    if (!manga?.id) return;

    const refreshReadingHistory = async () => {
      try {
        const response = await fetch(
          `/api/reading-history?provider=${encodeURIComponent(provider)}&mangaId=${encodeURIComponent(manga.id)}`
        );
        const historyData = (await response.json()) as ApiResponse<
          Array<{ externalChapterId: string }>
        >;
        if (historyData.success && historyData.data) {
          setReadChapterIds(
            new Set(historyData.data.map((h) => h.externalChapterId))
          );
        }
      } catch (err) {
        console.error("Error refreshing reading history:", err);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshReadingHistory();
      }
    };

    window.addEventListener("focus", refreshReadingHistory);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refreshReadingHistory);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [manga?.id, provider]);

  const handleBookmarkToggle = async () => {
    if (!manga) return;

    setBookmarkLoading(true);
    try {
      const method = isBookmarked ? "DELETE" : "POST";
      const response = await fetch("/api/manga/bookmark", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          mangaId: manga.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsBookmarked(!isBookmarked);

        toast.success(
          isBookmarked ? "Removed from library" : "Added to library"
        );
      } else {
        toast.error(data.error || "Failed to update library");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update library");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const chapterHref = (chapterId: string) =>
    `/reader/${encodeURIComponent(provider)}/${chapterId.replaceAll("/", "~")}`;

  const handleStartReading = () => {
    if (!manga) return;

    const target = getChapterToRead(manga.chapters, readChapterIds);
    if (target) {
      window.open(chapterHref(target.id), "_blank");
    }
  };

  const handleReadChapter = (chapterId: string) => {
    window.open(chapterHref(chapterId), "_blank");
  };

  // Show skeleton loading while manga data is loading
  if (mangaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <main className="container mx-auto px-4 py-8">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cover Image Skeleton */}
            <div className="lg:col-span-1">
              <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Skeleton */}
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              </div>

              {/* Genres Skeleton */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"
                  ></div>
                ))}
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  ></div>
                ))}
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Chapters Section Skeleton */}
          <div className="mt-12">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Could not load manga
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "The manga you're looking for doesn't exist."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => void fetchMangaData()}
            >
              Retry
            </Button>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                <Search className="h-4 w-4 mr-2" />
                Browse Manga
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/80 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Manga Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="mx-auto w-full max-w-[16rem] flex-shrink-0 md:mx-0">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg dark:bg-gray-700 sm:h-80 sm:aspect-auto">
                {manga.coverImage && (
                  <CatalogCover
                    src={manga.coverImage}
                    alt={manga.title}
                    width={256}
                    height={320}
                    provider={provider}
                    referer={manga.coverReferer}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Manga Info */}
            <div className="min-w-0 flex-1">
              <h1 className="mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-2xl font-bold break-words text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 sm:text-3xl md:text-4xl">
                {manga.title}
              </h1>
              <div className="mb-4">
                <Badge variant="outline" className="text-sm capitalize">
                  {provider}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{manga.author || "Unknown"}</span>
                </div>
                {manga.updatedAt && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(manga.updatedAt).toLocaleDateString()}</span>
                </div>
                )}
                <Badge
                  variant={manga.status === "ONGOING" || manga.status === "Ongoing" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {manga.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {manga.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-sm">
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {manga.description}
              </p>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button
                  onClick={handleStartReading}
                  disabled={metadataLoading}
                  size="lg"
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 sm:w-auto transform sm:hover:scale-105 sm:hover:-translate-y-1 active:scale-95 ${metadataLoading ? "opacity-50" : ""}`}
                >
                  {metadataLoading ? (
                    <>
                      <div className="animate-pulse h-4 w-4 bg-white/50 rounded mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {getContinueReadingLabel(manga.chapters, readChapterIds)}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading || metadataLoading}
                  variant="outline"
                  size="lg"
                  className={`w-full border-2 transition-all duration-300 sm:w-auto sm:transform sm:hover:scale-105 sm:hover:shadow-lg ${
                    isBookmarked
                      ? "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  } ${metadataLoading ? "opacity-50" : ""}`}
                >
                  {bookmarkLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : metadataLoading ? (
                    <>
                      <div className="animate-pulse h-4 w-4 bg-current/50 rounded mr-2"></div>
                      Loading...
                    </>
                  ) : isBookmarked ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {metadataLoading
                    ? "Loading..."
                    : isBookmarked
                      ? "In Library"
                      : "Add to Library"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Chapters */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
            Chapters ({manga.chapters.length})
          </h2>

          <div className="grid gap-4">
            {manga.chapters.map((chapter) => {
              const isRead = readChapterIds.has(chapter.id);
              return (
              <Card
                key={chapter.id}
                className={`hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 hover:from-blue-100/70 hover:to-purple-100/70 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 ${isRead ? "opacity-80" : ""}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center space-x-3 sm:space-x-4">
                      <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700 sm:h-16 sm:w-12">
                        {manga.coverImage && (
                          <CatalogCover
                            src={manga.coverImage}
                            alt={manga.title}
                            width={48}
                            height={64}
                            provider={provider}
                            referer={manga.coverReferer}
                            className="h-full w-full rounded object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="flex flex-wrap items-center gap-2 font-medium break-words text-gray-900 dark:text-white">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                          {isRead && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-xs text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            >
                              Read
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {chapter.pages > 0
                            ? `${chapter.pages} pages`
                            : "Page count unavailable"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleReadChapter(chapter.id)}
                      size="sm"
                      className="w-full shrink-0 border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:w-auto sm:transform sm:hover:scale-105 sm:hover:-translate-y-1 active:scale-95"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      {isRead ? "Read again" : "Read"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
