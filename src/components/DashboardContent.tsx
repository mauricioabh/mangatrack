"use client";

import { useState, useEffect } from "react";
import { BookOpen, Bell, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { notificationService } from "@/lib/notificationService";

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

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  mangaId: string;
  manga: Manga;
  read: boolean;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add a small delay to ensure MSW is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Fetch user profile
        const userResponse = await fetch("/api/user/profile");
        const userData = await userResponse.json();
        console.log("User profile response:", userData); // Debug log
        if (userData.success) {
          setUser(userData.data || userData.user); // Handle both data and user properties
        }

        // Fetch bookmarks
        const bookmarksResponse = await fetch("/api/manga/bookmarks");
        const bookmarksData = await bookmarksResponse.json();
        console.log("Bookmarks response:", bookmarksData); // Debug log
        console.log("Bookmarks data length:", bookmarksData.data?.length || 0); // Debug log
        if (bookmarksData.success) {
          setBookmarks(bookmarksData.data);
          console.log("Set bookmarks:", bookmarksData.data); // Debug log
        }

        // Fetch notifications
        const notificationsResponse = await fetch("/api/notifications");
        const notificationsData = await notificationsResponse.json();
        console.log("Notifications response:", notificationsData); // Debug log
        if (notificationsData.success) {
          setNotifications(notificationsData.data);

          // Process unread notifications for browser notifications
          const unreadNotifications = notificationsData.data.filter(
            (notification: Notification) => !notification.read
          );

          // Show browser notifications for unread notifications
          for (const notification of unreadNotifications) {
            await notificationService.processNotification(notification);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading your dashboard...
          </p>
        </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Here's what's happening with your manga collection.
          </p>
        </div>

        {/* Notification Permission Banner */}
        <NotificationPermissionBanner />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Bookmarks
              </CardTitle>
              <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {bookmarks.length}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Manga in your collection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Unread Notifications
              </CardTitle>
              <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {notifications.filter((n) => !n.read).length}
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                New updates available
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Bookmarks */}
          <div>
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
              <div className="space-y-4">
                {bookmarks.slice(0, 4).map((bookmark) => (
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

          {/* Recent Notifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Notifications
            </h2>

            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <Card
                    key={notification.id}
                    className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                      !notification.read
                        ? "border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10"
                        : "border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-900/10 dark:to-slate-900/10"
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You're all caught up! Check back later for updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
