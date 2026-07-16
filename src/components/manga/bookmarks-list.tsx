"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CatalogCover } from "@/components/manga/catalog-cover";

interface Bookmark {
  id: string;
  createdAt: string;
  provider: string;
  externalMangaId: string;
  manga: {
    id: string;
    provider?: string;
    title: string;
    coverImage?: string;
    author?: string;
  } | null;
}

interface BookmarksListProps {
  initialBookmarks?: Bookmark[];
}

export function BookmarksList({ initialBookmarks = [] }: BookmarksListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/manga/bookmarks");
      const data = await response.json();

      if (data.success) {
        setBookmarks(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBookmarks.length === 0) {
      fetchBookmarks();
    }
  }, [initialBookmarks.length]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            My Library
          </CardTitle>
          <CardDescription>Your bookmarked manga series</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          My Library
        </CardTitle>
        <CardDescription>Your bookmarked manga series</CardDescription>
      </CardHeader>
      <CardContent>
        {bookmarks.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {bookmarks.map((bookmark) => {
              if (!bookmark.manga) return null;
              const manga = bookmark.manga;
              return (
                <div
                  key={bookmark.id}
                  className="flex items-center space-x-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 hover:from-blue-100/70 hover:to-purple-100/70 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                    {manga.coverImage && (
                      <CatalogCover
                        src={manga.coverImage}
                        alt={manga.title}
                        width={64}
                        height={80}
                        provider={bookmark.provider || manga.provider}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {manga.title}
                    </h3>
                    {manga.author && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {manga.author}
                      </p>
                    )}
                    <Link
                      href={`/manga/${encodeURIComponent(bookmark.provider || manga.provider || "")}/${encodeURIComponent(manga.id)}`}
                    >
                      <Button size="sm" variant="outline" className="mt-2">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No manga in your library yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start exploring and add manga to your library!
            </p>
            <Link href="/search">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Discover Manga
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
