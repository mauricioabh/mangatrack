"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

interface ReaderPageProps {
  params: Promise<{
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
  slug: string;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState("vertical"); // vertical, horizontal
  const [imageFit, setImageFit] = useState("width"); // width, height, original

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { chapterId } = await params;
        // Fetch chapter and manga data
        const response = await fetch(`/api/chapters/${chapterId}`);
        const data = await response.json();

        if (data.success) {
          setChapter(data.chapter);
          setManga(data.manga);
          setChapters(data.chapters);
        } else {
          console.error("Chapter fetch failed:", data.error);
          // Don't call notFound() immediately, let the component handle it
          setChapter(null);
          setManga(null);
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
        // Don't call notFound() immediately, let the component handle it
        setChapter(null);
        setManga(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handlePageChange = (direction: "prev" | "next") => {
    if (!chapter) return;

    if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < chapter.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleChapterChange = (direction: "prev" | "next") => {
    if (!chapter) return;

    const currentIndex = chapters.findIndex((c) => c.id === chapter.id);

    if (direction === "prev" && currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      window.location.href = `/reader/${prevChapter.id}`;
    } else if (direction === "next" && currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      window.location.href = `/reader/${nextChapter.id}`;
    }
  };

  // Auto-mark as read when reaching the end
  useEffect(() => {
    const markAsRead = async () => {
      if (!chapter) return;

      try {
        await fetch("/api/reading-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chapterId: chapter.id,
            mangaId: manga?.id,
          }),
        });
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    };

    if (chapter && currentPage === chapter.pages.length - 1) {
      markAsRead();
    }
  }, [currentPage, chapter, manga?.id]);

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
          <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
          <p className="text-gray-400 mb-6">
            The chapter you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/search">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Manga
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!chapter || !manga) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-400 mb-6">
            The chapter you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex((c) => c.id === chapter.id);
  const hasPrevChapter = currentChapterIndex > 0;
  const hasNextChapter = currentChapterIndex < chapters.length - 1;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 shadow-2xl border-b-4 border-white/20 dark:border-gray-800/20 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/manga/${manga.slug}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold truncate max-w-md text-white drop-shadow-lg">
                  {manga.title}
                </h1>
                <p className="text-sm text-white/80 drop-shadow-md">
                  Chapter {chapter.chapterNumber}: {chapter.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={readingMode} onValueChange={setReadingMode}>
                <SelectTrigger className="w-32 bg-black/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
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
                <SelectTrigger className="w-32 bg-black/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
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
      <main className="pt-16">
        {readingMode === "vertical" ? (
          // Vertical Reading Mode
          <div className="max-w-4xl mx-auto px-4 py-8">
            {chapter.pages.map((page: string, index: number) => (
              <div key={index} className="mb-4">
                <Image
                  src={page}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className={`w-full ${
                    imageFit === "width"
                      ? "h-auto"
                      : imageFit === "height"
                        ? "h-screen object-contain"
                        : "h-auto"
                  }`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          // Horizontal Reading Mode
          <div className="h-screen flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {chapter.pages.length > 0 && (
                <Image
                  src={chapter.pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  width={800}
                  height={1200}
                  className={`max-w-full max-h-full ${
                    imageFit === "width"
                      ? "w-full h-auto"
                      : imageFit === "height"
                        ? "h-full w-auto"
                        : "max-w-full max-h-full"
                  }`}
                />
              )}

              {/* Navigation Overlay */}
              <div className="absolute inset-0 flex items-center justify-between px-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black/50 border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 0}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black/50 border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === chapter.pages.length - 1}
                >
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-800 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-gray-700 text-white hover:bg-gray-800"
                onClick={() => handleChapterChange("prev")}
                disabled={!hasPrevChapter}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>

              {readingMode === "horizontal" && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    {currentPage + 1} / {chapter.pages.length}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {readingMode === "horizontal" && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => setCurrentPage(0)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    First Page
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-gray-700 text-white hover:bg-gray-800"
                onClick={() => handleChapterChange("next")}
                disabled={!hasNextChapter}
              >
                Next Chapter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chapter Complete Modal */}
      {currentPage === chapter.pages.length - 1 && (
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
                    className="w-full"
                  >
                    Read Next Chapter
                  </Button>
                )}
                <Link href={`/manga/${manga.slug}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Back to Manga
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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
