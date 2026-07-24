"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import { mangaPath } from "@/lib/consumet/ids";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Mark notification as read with loading state
  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    await markAsRead(notificationId);
    setMarkingAsRead(null);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_CHAPTER":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "MANGA_UPDATE":
        return <ExternalLink className="h-4 w-4 text-green-600" />;
      case "SYSTEM":
        return <Bell className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm p-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown — fixed on mobile so body overflow-x-hidden cannot clip it */}
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed left-2 right-2 z-50 flex max-h-[min(24rem,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-5rem))] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 top-[calc(env(safe-area-inset-top,0px)+3.75rem)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-h-none"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="shrink-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sm:max-h-96">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    You&apos;ll see updates about your manga here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        !notification.read
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="mt-0.5 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-sm break-words text-gray-600 dark:text-gray-300">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                {getTimeAgo(notification.createdAt)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="ml-2 flex shrink-0 items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  disabled={markingAsRead === notification.id}
                                  className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                                >
                                  {markingAsRead === notification.id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-green-600"></div>
                                  ) : (
                                    <Check className="h-3 w-3 text-green-600" />
                                  )}
                                </Button>
                              )}

                              {notification.mangaId && notification.provider && (
                                <Link
                                  href={mangaPath(
                                    notification.provider,
                                    notification.mangaId
                                  )}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                  >
                                    <ExternalLink className="h-3 w-3 text-blue-600" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="mt-2 h-2 w-2 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-700">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  >
                    View all notifications
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
