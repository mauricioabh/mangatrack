"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  ArrowLeft,
  Star,
  Calendar,
  User,
  Search,
  Bookmark,
  Play,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface Manga {
  id: string;
  title: string;
  slug: string;
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

interface MangaDetailContentProps {
  slug: string;
}

export default function MangaDetailContent({ slug }: MangaDetailContentProps) {
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [lastReadChapter, setLastReadChapter] = useState<number | null>(null);

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        // Fetch manga details
        const mangaResponse = await fetch(`/api/manga/${slug}`);
        const mangaData = await mangaResponse.json();

        if (mangaData.success) {
          setManga(mangaData.data);

          // Fetch bookmark status
          const bookmarkResponse = await fetch(
            `/api/manga/bookmark?mangaId=${mangaData.data.id}`
          );
          const bookmarkData = await bookmarkResponse.json();
          setIsBookmarked(bookmarkData.success && bookmarkData.isBookmarked);

          // Fetch reading history for last read chapter
          const historyResponse = await fetch(
            `/api/reading-history?mangaId=${mangaData.data.id}`
          );
          const historyData = await historyResponse.json();
          if (historyData.success && historyData.data.length > 0) {
            const lastChapter = Math.max(
              ...historyData.data.map((h: any) => h.chapterNumber)
            );
            setLastReadChapter(lastChapter);
          }
        } else {
          console.error("Manga API response:", mangaData);
          setError(mangaData.error || "Manga not found");
        }
      } catch (err) {
        setError("Failed to load manga details");
        console.error("Error fetching manga:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaData();
  }, [slug]);

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

    if (lastReadChapter) {
      // Resume from last read chapter
      const nextChapter = manga.chapters.find(
        (c) => c.chapterNumber === lastReadChapter + 1
      );
      if (nextChapter) {
        window.open(`/reader/${nextChapter.id}`, "_blank");
      } else {
        // Start from first chapter if no next chapter
        const firstChapter = manga.chapters[0];
        if (firstChapter) {
          window.open(`/reader/${firstChapter.id}`, "_blank");
        }
      }
    } else {
      // Start from first chapter
      const firstChapter = manga.chapters[0];
      if (firstChapter) {
        window.open(`/reader/${firstChapter.id}`, "_blank");
      }
    }
  };

  const handleReadChapter = (chapterId: string) => {
    window.open(`/reader/${chapterId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading manga details...
          </p>
        </div>
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
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {lastReadChapter
                    ? `Resume Chapter ${lastReadChapter + 1}`
                    : "Start Reading"}
                </Button>
                <Button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  variant="outline"
                  size="lg"
                  className={`border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    isBookmarked
                      ? "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  }`}
                >
                  {bookmarkLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : isBookmarked ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isBookmarked ? "In Library" : "Add to Library"}
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
            {manga.chapters.map((chapter) => (
              <Card
                key={chapter.id}
                className="hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 hover:from-blue-100/70 hover:to-purple-100/70 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
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
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {chapter.pages} pages
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleReadChapter(chapter.id)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
