"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationPermission {
  permission: NotificationPermission | null;
  isSupported: boolean;
  isGranted: boolean;
  isDenied: boolean;
  isDefault: boolean;
}

interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: Record<string, unknown>;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    permission: null,
    isSupported: false,
    isGranted: false,
    isDenied: false,
    isDefault: false,
  });

  // Check if notifications are supported and get current permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission({
        permission:
          Notification.permission as unknown as NotificationPermission,
        isSupported: true,
        isGranted: Notification.permission === "granted",
        isDenied: Notification.permission === "denied",
        isDefault: Notification.permission === "default",
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!permission.isSupported) {
      console.warn("Browser notifications are not supported");
      return false;
    }

    if (permission.isGranted) {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission({
        permission: result as unknown as NotificationPermission,
        isSupported: true,
        isGranted: result === "granted",
        isDenied: result === "denied",
        isDefault: result === "default",
      });
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [permission.isSupported, permission.isGranted]);

  // Show a browser notification
  const showNotification = useCallback(
    (options: BrowserNotificationOptions): Notification | null => {
      if (!permission.isGranted) {
        console.warn("Notification permission not granted");
        return null;
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/favicon.svg",
          badge: options.badge || "/favicon.svg",
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          data: options.data,
        });

        // Auto-close notification after 5 seconds unless requireInteraction is true
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        return notification;
      } catch (error) {
        console.error("Error showing notification:", error);
        return null;
      }
    },
    [permission.isGranted]
  );

  // Show a manga-related notification
  const showMangaNotification = useCallback(
    (title: string, message: string, mangaId?: string) => {
      return showNotification({
        title,
        body: message,
        tag: mangaId ? `manga-${mangaId}` : undefined,
        icon: "/favicon.svg",
        data: { mangaId },
      });
    },
    [showNotification]
  );

  // Show a new chapter notification
  const showNewChapterNotification = useCallback(
    (mangaTitle: string, chapterTitle: string, mangaId: string) => {
      return showMangaNotification(
        `New Chapter: ${mangaTitle}`,
        `Chapter ${chapterTitle} is now available!`,
        mangaId
      );
    },
    [showMangaNotification]
  );

  // Show a system notification
  const showSystemNotification = useCallback(
    (title: string, message: string) => {
      return showNotification({
        title,
        body: message,
        tag: "system",
        icon: "/favicon.svg",
      });
    },
    [showNotification]
  );

  return {
    permission,
    requestPermission,
    showNotification,
    showMangaNotification,
    showNewChapterNotification,
    showSystemNotification,
  };
}
