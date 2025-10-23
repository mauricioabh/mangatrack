"use client";

import { useState, useEffect } from "react";
import { BookOpen, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
// Cache removed - using regular fetch for fresh data

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
  }>;
}

interface Bookmark {
  id: string;
  userId: string;
  mangaId: string;
  manga: Manga;
  createdAt: string;
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar: string;
  tier: string;
}

export default function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("🔄 Dashboard fetching data...");

      // Make API calls in parallel for fresh data every time
      // Note: notifications are handled by NotificationDropdown component
      const [userResponse, bookmarksResponse] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/manga/bookmarks"),
      ]);

      const [userData, bookmarksData] = await Promise.all([
        userResponse.json(),
        bookmarksResponse.json(),
      ]);

      console.log("📊 Dashboard data received:", {
        user: userData?.user?.name || "No user",
        bookmarks: bookmarksData?.data?.length || 0,
      });

      console.log("User profile response:", userData);
      console.log("Bookmarks response:", bookmarksData);

      // Update state with all data
      if (userData?.success) {
        setUser(userData.user || null);
      }

      if (bookmarksData?.success) {
        setBookmarks(bookmarksData.data);
        console.log("Set bookmarks:", bookmarksData.data);
      }

      // Notifications are handled by NotificationDropdown component
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when user returns to dashboard (e.g., from manga details)
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if we're not already loading
      if (!loading) {
        console.log("🔄 Dashboard focused - refreshing data");
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section with Total Bookmarks Skeleton */}
          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            {/* Welcome Message Skeleton - Left Side */}
            <div className="lg:col-span-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Total Bookmarks Skeleton - Right Side */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Bookmarks Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                        <div className="flex items-center space-x-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
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
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section with Total Bookmarks */}
        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Welcome Message - Left Side */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Here&apos;s what&apos;s happening with your manga collection.
            </p>
          </div>

          {/* Total Bookmarks - Right Side */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Bookmarks
                </CardTitle>
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {bookmarks.length}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Manga in your collection
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Bookmarks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Bookmarks
            </h2>
            <Link href="/search">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse More
              </Button>
            </Link>
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bookmarks.slice(0, 6).map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 hover:from-blue-100/70 hover:to-purple-100/70 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                        {bookmark.manga.coverImage && (
                          <Image
                            src={bookmark.manga.coverImage}
                            alt={bookmark.manga.title}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {bookmark.manga.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {bookmark.manga.author}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {bookmark.manga.status}
                          </Badge>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {bookmark.manga.chapters.length} chapters
                          </span>
                        </div>
                      </div>
                      <Link href={`/manga/${bookmark.manga.slug}`}>
                        <Button size="sm" variant="outline">
                          Read
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookmarks yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start exploring and bookmark your favorite manga!
                </p>
                <Link href="/search">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95">
                    <Search className="h-4 w-4 mr-2" />
                    Discover Manga
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
