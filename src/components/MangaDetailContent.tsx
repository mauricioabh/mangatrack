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
import Image from "next/image";
import { toast } from "sonner";
import {
  getChapterToRead,
  getContinueReadingLabel,
} from "@/lib/reading-progress";

interface Manga {
  id: string;
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
    pagesData?: string[]; // Original pages array for reader
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  isBookmarked?: boolean;
  error?: string;
}

interface MangaDetailContentProps {
  mangaId: string;
}

export default function MangaDetailContent({
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

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        // Fetch manga details first to get the manga ID
        const mangaResponse = await fetch(`/api/manga/${mangaId}`);
        const mangaData = (await mangaResponse.json()) as ApiResponse<Manga>;

        if (!mangaResponse.ok) {
          setError(mangaData.error ?? "Failed to load manga details");
          return;
        }

        if (mangaData.success && mangaData.data) {
          setManga(mangaData.data);
          setMangaLoading(false); // Manga data is loaded

          // Now make parallel calls for bookmark status and reading history
          const [bookmarkResponse, historyResponse] = await Promise.all([
            fetch(`/api/manga/bookmark?mangaId=${mangaData.data.id}`),
            fetch(`/api/reading-history?mangaId=${mangaData.data.id}`),
          ]);

          const [bookmarkData, historyData] = await Promise.all([
            bookmarkResponse.json(),
            historyResponse.json(),
          ]);

          // Update bookmark status
          const bookmarkApiResponse = bookmarkData as unknown as ApiResponse<{
            isBookmarked: boolean;
          }>;
          setIsBookmarked(
            bookmarkApiResponse.success && !!bookmarkApiResponse.isBookmarked
          );

          const historyApiResponse = historyData as unknown as ApiResponse<
            Array<{ chapterDexId: string }>
          >;
          if (historyApiResponse.success && historyApiResponse.data) {
            setReadChapterIds(
              new Set(
                historyApiResponse.data.map((h) => h.chapterDexId)
              )
            );
          }

          setMetadataLoading(false); // Metadata is loaded
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

    fetchMangaData();
  }, [mangaId]);

  useEffect(() => {
    if (!manga?.id) return;

    const refreshReadingHistory = async () => {
      try {
        const response = await fetch(
          `/api/reading-history?mangaId=${manga.id}`
        );
        const historyData = (await response.json()) as ApiResponse<
          Array<{ chapterDexId: string }>
        >;
        if (historyData.success && historyData.data) {
          setReadChapterIds(
            new Set(historyData.data.map((h) => h.chapterDexId))
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
  }, [manga?.id]);

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

  const handleStartReading = () => {
    if (!manga) return;

    const target = getChapterToRead(manga.chapters, readChapterIds);
    if (target) {
      window.open(`/reader/${target.id}`, "_blank");
    }
  };

  const handleReadChapter = (chapterId: string) => {
    window.open(`/reader/${chapterId}`, "_blank");
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
            Manga Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "The manga you're looking for doesn't exist."}
          </p>
          <Link href="/search">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95">
              <Search className="h-4 w-4 mr-2" />
              Browse Manga
            </Button>
          </Link>
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
            <div className="flex-shrink-0">
              <div className="w-64 h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                {manga.coverImage && (
                  <Image
                    src={manga.coverImage}
                    alt={manga.title}
                    width={256}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Manga Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                {manga.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{manga.author}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(manga.updatedAt).toLocaleDateString()}</span>
                </div>
                <Badge
                  variant={manga.status === "Ongoing" ? "default" : "secondary"}
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

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleStartReading}
                  disabled={metadataLoading}
                  size="lg"
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 ${metadataLoading ? "opacity-50" : ""}`}
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
                  className={`border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
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
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                        {manga.coverImage && (
                          <Image
                            src={manga.coverImage}
                            alt={manga.title}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                          {isRead && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
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
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
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
