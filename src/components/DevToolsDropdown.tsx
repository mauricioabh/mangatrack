"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Bug,
  Mail,
  Database,
  TestTube,
  Monitor,
  Server,
  Plug,
  BookOpen,
  ArrowUp,
  Bell,
  Loader2,
  Wrench,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

export function DevToolsDropdown() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load mock data state
    if (typeof window !== "undefined") {
      const { MOCK_CONFIG } = require("@/lib/mock-config");
      setUseMockData(MOCK_CONFIG.getUseMockData());
    }
  }, []);

  // Don't render on server side
  if (!isClient) {
    return null;
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const toggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    const { MOCK_CONFIG } = require("@/lib/mock-config");
    MOCK_CONFIG.setUseMockData(newValue);
    window.location.reload();
  };

  const triggerSentryError = async (type: "client" | "server" | "api") => {
    setIsLoading(true);

    try {
      switch (type) {
        case "client":
          // Trigger a client-side error
          throw new Error("🧪 Test client-side error for Sentry!");

        case "server":
          // Trigger a server-side error via API
          const response = await fetch("/api/test-sentry-error", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "server" }),
          });

          if (!response.ok) {
            throw new Error("Server error response");
          }

          const data = await response.json();
          toast.success(`✅ ${data.message}`);
          break;

        case "api":
          // Trigger an API error
          await fetch("/api/test-sentry-error", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "api" }),
          });
          break;
      }
    } catch (error) {
      console.error("Sentry test error:", error);
      toast.success("🎯 Error sent to Sentry! Check your Sentry dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateEmailNotification = async (
    type: "NEW_CHAPTER" | "MANGA_UPDATE" | "SYSTEM"
  ) => {
    setIsLoading(true);

    try {
      // For demo purposes, we'll use mock IDs
      const mockMangaId = "clx1234567890abcdef"; // One Piece from mock data
      const mockChapterId = "chapter-1"; // First chapter

      const payload: any = { type };

      if (type === "NEW_CHAPTER") {
        payload.mangaId = mockMangaId;
        payload.chapterId = mockChapterId;
      } else if (type === "MANGA_UPDATE") {
        payload.mangaId = mockMangaId;
      }

      const response = await fetch("/api/simulate-email-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`📧 ${data.message}`);
      } else {
        toast.error(data.error || "Failed to send email notification");
      }
    } catch (error) {
      console.error("Error simulating email notification:", error);
      toast.error("Failed to send email notification");
    } finally {
      setIsLoading(false);
    }
  };

  const testBrowserNotification = async () => {
    setIsLoading(true);

    try {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        toast.error("Browser notifications are not supported in this browser");
        return;
      }

      // Check current permission
      let permission = Notification.permission;

      // Request permission if not granted
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "denied") {
        toast.error(
          "Browser notifications are blocked. Please enable them in your browser settings."
        );
        return;
      }

      if (permission === "granted") {
        // Show a test browser notification
        const notification = new Notification(
          "🔔 MangaTrack Test Notification",
          {
            body: "This is a test browser notification from MangaTrack!",
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            tag: "mangatrack-test",
            requireInteraction: false,
            silent: false,
          }
        );

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        toast.success("📱 Browser notification sent!");
      }
    } catch (error) {
      console.error("Error testing browser notification:", error);
      toast.error("Failed to send browser notification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm p-2"
          title="Development Tools"
        >
          <Wrench className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Development Tools</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Mock Data Toggle */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Data Source
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={toggleMockData} disabled={isLoading}>
            <Database className="h-4 w-4 mr-2" />
            {useMockData ? "Switch to Real Data" : "Switch to Mock Data"}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sentry Testing */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Sentry Testing
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => triggerSentryError("client")}
            disabled={isLoading}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Test Client Error
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => triggerSentryError("server")}
            disabled={isLoading}
          >
            <Server className="h-4 w-4 mr-2" />
            Test Server Error
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => triggerSentryError("api")}
            disabled={isLoading}
          >
            <Plug className="h-4 w-4 mr-2" />
            Test API Error
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Email Testing */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Email Notifications
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => simulateEmailNotification("NEW_CHAPTER")}
            disabled={isLoading}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Simulate New Chapter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => simulateEmailNotification("MANGA_UPDATE")}
            disabled={isLoading}
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Simulate Manga Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => simulateEmailNotification("SYSTEM")}
            disabled={isLoading}
          >
            <Bell className="h-4 w-4 mr-2" />
            Simulate System Notification
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Browser Notifications */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Browser Notifications
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={testBrowserNotification}
            disabled={isLoading}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Test Browser Notification
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {isLoading && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
