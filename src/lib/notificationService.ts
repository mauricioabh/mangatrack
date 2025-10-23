"use client";

import { toast } from "sonner";

interface NotificationData {
  id: string;
  type: "NEW_CHAPTER" | "MANGA_UPDATE" | "SYSTEM";
  title: string;
  message: string;
  mangaId?: string;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  private static instance: NotificationService;
  private browserNotifications: Record<string, unknown> | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize the notification service
  public async initialize() {
    if (this.isInitialized) return;

    try {
      // Dynamically import the hook to avoid SSR issues
      await import("@/hooks/useBrowserNotifications");

      // Check if we're in the browser
      if (typeof window !== "undefined") {
        this.browserNotifications = {
          permission: Notification.permission,
          isSupported: "Notification" in window,
          isGranted: Notification.permission === "granted",
        };
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing notification service:", error);
    }
  }

  // Request browser notification permission
  public async requestPermission(): Promise<boolean> {
    if (!this.browserNotifications?.isSupported) {
      return false;
    }

    if (this.browserNotifications.isGranted) {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.browserNotifications.isGranted = permission === "granted";
      this.browserNotifications.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  // Show a browser notification
  private showBrowserNotification(
    title: string,
    body: string,
    options: {
      icon?: string;
      tag?: string;
      requireInteraction?: boolean;
      data?: Record<string, unknown>;
    } = {}
  ): Notification | null {
    if (!this.browserNotifications?.isGranted) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: options.icon || "/favicon.svg",
        badge: "/favicon.svg",
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: false,
        data: options.data,
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error("Error showing browser notification:", error);
      return null;
    }
  }

  // Show a toast notification
  private showToastNotification(
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "info"
  ) {
    switch (type) {
      case "success":
        toast.success(title, { description: message });
        break;
      case "error":
        toast.error(title, { description: message });
        break;
      case "warning":
        toast.warning(title, { description: message });
        break;
      default:
        toast.info(title, { description: message });
        break;
    }
  }

  // Process a notification from the API
  public async processNotification(notification: NotificationData) {
    await this.initialize();

    const { type, title, message, mangaId } = notification;

    // Always show toast notification
    this.showToastNotification(title, message, "info");

    // Show browser notification if permission is granted
    if (this.browserNotifications?.isGranted) {
      let browserTitle = title;
      let browserBody = message;

      // Customize based on notification type
      switch (type) {
        case "NEW_CHAPTER":
          browserTitle = `📖 ${title}`;
          browserBody = `New chapter available: ${message}`;
          break;
        case "MANGA_UPDATE":
          browserTitle = `📚 ${title}`;
          browserBody = `Manga update: ${message}`;
          break;
        case "SYSTEM":
          browserTitle = `🔔 ${title}`;
          break;
      }

      this.showBrowserNotification(browserTitle, browserBody, {
        tag: mangaId ? `manga-${mangaId}` : `notification-${notification.id}`,
        data: { notificationId: notification.id, mangaId },
      });
    }
  }

  // Show a new chapter notification
  public async showNewChapterNotification(
    mangaTitle: string,
    chapterTitle: string,
    mangaId: string
  ) {
    await this.initialize();

    const title = `New Chapter: ${mangaTitle}`;
    const message = `Chapter ${chapterTitle} is now available!`;

    // Show toast
    this.showToastNotification(title, message, "success");

    // Show browser notification
    if (this.browserNotifications?.isGranted) {
      this.showBrowserNotification(`📖 ${title}`, message, {
        tag: `manga-${mangaId}`,
        data: { mangaId, type: "new_chapter" },
      });
    }
  }

  // Show a system notification
  public async showSystemNotification(title: string, message: string) {
    await this.initialize();

    // Show toast
    this.showToastNotification(title, message, "info");

    // Show browser notification
    if (this.browserNotifications?.isGranted) {
      this.showBrowserNotification(`🔔 ${title}`, message, {
        tag: "system",
        data: { type: "system" },
      });
    }
  }

  // Check if browser notifications are supported and granted
  public getBrowserNotificationStatus() {
    return {
      isSupported: this.browserNotifications?.isSupported || false,
      isGranted: this.browserNotifications?.isGranted || false,
      permission: this.browserNotifications?.permission || "default",
    };
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
