"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { getChapterNeighbors } from "@/lib/consumet/mappers";

interface ReaderPageProps {
  params: Promise<{
    provider: string;
    chapterId: string;
  }>;
}

interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  pages: string[];
}

interface Manga {
  id: string;
  title: string;
  provider?: string;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [provider, setProvider] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState("vertical"); // vertical, horizontal
  const [imageFit, setImageFit] = useState("width"); // width, height, original
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const markedChapterIdRef = useRef<string | null>(null);
  const lastPageObserverRef = useRef<IntersectionObserver | null>(null);
  const userEngagedRef = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const resolved = await params;
      const p = decodeURIComponent(resolved.provider);
      const chapterId = decodeURIComponent(resolved.chapterId);
      setProvider(p);
      const response = await fetch(
        `/api/chapters/${encodeURIComponent(p)}/${chapterId}`
      );
      const data = await response.json();

      if (data.success) {
        setChapter(data.chapter);
        setManga(data.manga);
        setChapters(data.chapters);
      } else {
        console.error("Chapter fetch failed:", data.error);
        setLoadError(data.error ?? "Failed to load chapter");
        setChapter(null);
        setManga(null);
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
      setLoadError("Failed to load chapter");
      setChapter(null);
      setManga(null);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setShowCompleteModal(false);
    markedChapterIdRef.current = null;
    userEngagedRef.current = false;
  }, [chapter?.id]);

  useEffect(() => {
    const engage = () => {
      userEngagedRef.current = true;
    };
    window.addEventListener("scroll", engage, { passive: true });
    window.addEventListener("wheel", engage, { passive: true });
    window.addEventListener("touchstart", engage, { passive: true });
    window.addEventListener("keydown", engage);
    return () => {
      window.removeEventListener("scroll", engage);
      window.removeEventListener("wheel", engage);
      window.removeEventListener("touchstart", engage);
      window.removeEventListener("keydown", engage);
    };
  }, [chapter?.id]);

  const markChapterAsRead = useCallback(
    async (options?: { showCompletionModal?: boolean }) => {
      if (!chapter || !manga?.id) return false;
      if (markedChapterIdRef.current === chapter.id) {
        if (options?.showCompletionModal) {
          setShowCompleteModal(true);
        }
        return true;
      }

      markedChapterIdRef.current = chapter.id;

      try {
        const response = await fetch("/api/reading-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            chapterId: chapter.id,
            mangaId: manga.id,
          }),
        });
        if (!response.ok) {
          markedChapterIdRef.current = null;
          return false;
        }
        if (options?.showCompletionModal) {
          setShowCompleteModal(true);
        }
        return true;
      } catch (error) {
        markedChapterIdRef.current = null;
        console.error("Error marking as read:", error);
        return false;
      }
    },
    [chapter, manga?.id, provider]
  );

  const handlePageChange = (direction: "prev" | "next") => {
    if (!chapter) return;

    if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < chapter.pages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (nextPage === chapter.pages.length - 1) {
        userEngagedRef.current = true;
        void markChapterAsRead({ showCompletionModal: true });
      }
    }
  };

  const handleChapterChange = (direction: "prev" | "next") => {
    if (!chapter) return;

    const goNext = async () => {
      if (direction === "next") {
        userEngagedRef.current = true;
        await markChapterAsRead({ showCompletionModal: false });
      }
      const { next, previous } = getChapterNeighbors(chapters, chapter.id);
      const target = direction === "next" ? next : previous;
      if (target) {
        window.location.href = `/reader/${encodeURIComponent(provider)}/${target.id.replaceAll("/", "~")}`;
      }
    };

    void goNext();
  };

  useEffect(() => {
    lastPageObserverRef.current?.disconnect();
    lastPageObserverRef.current = null;

    if (
      readingMode !== "vertical" ||
      !chapter ||
      chapter.pages.length === 0
    ) {
      return;
    }

    const lastPageEl = document.getElementById("reader-last-page");
    if (!lastPageEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          userEngagedRef.current &&
          entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
        ) {
          void markChapterAsRead({ showCompletionModal: true });
        }
      },
      { threshold: [0.5, 0.9] }
    );
    observer.observe(lastPageEl);
    lastPageObserverRef.current = observer;

    return () => observer.disconnect();
  }, [readingMode, chapter, markChapterAsRead]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !manga) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">Could not load chapter</h1>
          <p className="text-gray-400 mb-6">
            {loadError ||
              "The chapter you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="border-gray-600 text-white"
              onClick={() => void fetchData()}
            >
              Retry
            </Button>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Manga
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { next: nextChapter, previous: previousChapter } =
    getChapterNeighbors(chapters, chapter.id);
  const hasNextChapter = nextChapter !== null;
  const hasPrevChapter = previousChapter !== null;

  const chapterNavButtonClass =
    "bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:hover:bg-gray-700/40 backdrop-blur-sm disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-white/20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl backdrop-blur-sm dark:border-gray-800/20 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700">
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 sm:space-x-4">
              <Link href={`/manga/${encodeURIComponent(provider)}/${encodeURIComponent(manga.id)}`} className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 dark:border-gray-700/50 dark:bg-gray-800/30 dark:text-white dark:hover:bg-gray-700/40 sm:hover:scale-105 sm:hover:shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white drop-shadow-lg sm:max-w-md sm:text-lg">
                  {manga.title}
                </h1>
                <p className="truncate text-xs text-white/80 drop-shadow-md sm:text-sm">
                  Ch. {chapter.chapterNumber}: {chapter.title}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className={chapterNavButtonClass}
                onClick={() => handleChapterChange("prev")}
                disabled={!hasPrevChapter}
              >
                <ArrowLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={chapterNavButtonClass}
                onClick={() => handleChapterChange("next")}
                disabled={!hasNextChapter}
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="h-4 w-4 sm:ml-1" />
              </Button>

              <Select value={readingMode} onValueChange={setReadingMode}>
                <SelectTrigger className="h-8 w-[7.5rem] border-gray-700 bg-black/50 text-xs text-white sm:h-9 sm:w-32 sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  <SelectItem
                    value="vertical"
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    Vertical
                  </SelectItem>
                  <SelectItem
                    value="horizontal"
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    Horizontal
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={imageFit} onValueChange={setImageFit}>
                <SelectTrigger className="h-8 w-[7.5rem] border-gray-700 bg-black/50 text-xs text-white sm:h-9 sm:w-32 sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  <SelectItem
                    value="width"
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    Fit Width
                  </SelectItem>
                  <SelectItem
                    value="height"
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    Fit Height
                  </SelectItem>
                  <SelectItem
                    value="original"
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    Original
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Reader Content */}
      <main className="pt-28 pb-20 sm:pt-20 sm:pb-16">
        {readingMode === "vertical" ? (
          // Vertical Reading Mode
          <div className="max-w-4xl mx-auto px-4 py-8">
            {chapter.pages.map((page: string, index: number) => (
              <div
                key={index}
                id={
                  index === chapter.pages.length - 1
                    ? "reader-last-page"
                    : undefined
                }
                className="mb-4"
              >
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className={`w-full ${
                    imageFit === "width"
                      ? "h-auto"
                      : imageFit === "height"
                        ? "h-screen object-contain"
                        : "h-auto"
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        ) : (
          // Horizontal Reading Mode
          <div className="h-screen flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {chapter.pages.length > 0 ? (
                <img
                  src={chapter.pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className={`max-w-full max-h-full ${
                    imageFit === "width"
                      ? "w-full h-auto"
                      : imageFit === "height"
                        ? "h-full w-auto"
                        : "max-w-full max-h-full"
                  }`}
                  decoding="async"
                />
              ) : null}

              {/* Navigation Overlay */}
              <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-700 bg-black/50 text-white hover:bg-gray-800"
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 0}
                >
                  <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-700 bg-black/50 text-white hover:bg-gray-800"
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === chapter.pages.length - 1}
                >
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 bg-black/50 text-white hover:bg-gray-800"
                onClick={() => handleChapterChange("prev")}
                disabled={!hasPrevChapter}
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous Chapter</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              {readingMode === "horizontal" && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 sm:text-sm">
                    {currentPage + 1} / {chapter.pages.length}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:space-x-4">
              {readingMode === "horizontal" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden border-gray-700 bg-black/50 text-white hover:bg-gray-800 sm:inline-flex"
                  onClick={() => setCurrentPage(0)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  First Page
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 bg-black/50 text-white hover:bg-gray-800"
                onClick={() => handleChapterChange("next")}
                disabled={!hasNextChapter}
              >
                <span className="hidden sm:inline">Next Chapter</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="ml-1 h-4 w-4 sm:ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chapter Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-700 text-white max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Chapter Complete!</h3>
              <p className="text-gray-300 mb-6">
                You&apos;ve finished reading this chapter. What would you like
                to do next?
              </p>
              <div className="flex flex-col space-y-3">
                {hasNextChapter && (
                  <Button
                    onClick={() => handleChapterChange("next")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                  >
                    Read Next Chapter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                <Link href={`/manga/${encodeURIComponent(provider)}/${encodeURIComponent(manga.id)}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                  >
                    Back to Manga
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
