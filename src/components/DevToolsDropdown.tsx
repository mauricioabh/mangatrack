"use client";

import { useState } from "react";
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
import { Mail, Loader2, Wrench, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_CONSUMET_MANGA } from "@/lib/consumet/sample-ids";
// Sentry removed

export function DevToolsDropdown() {
  const [isLoading, setIsLoading] = useState(false);

  // Always show DevTools - no environment validation
  console.log("✅ DevToolsDropdown visible - always enabled");

  // Sentry functionality removed

  const simulateEmailNotification = async (
    type: "NEW_CHAPTER" | "MANGA_UPDATE" | "SYSTEM"
  ) => {
    setIsLoading(true);

    try {
      // MangaDex UUIDs for notification simulation
      const payload: Record<string, unknown> = {
        type,
        timestamp: new Date().toISOString(),
      };

      const sample = SAMPLE_CONSUMET_MANGA.onePieceMangaHere;
      if (type === "NEW_CHAPTER") {
        payload.provider = sample.provider;
        payload.mangaId = sample.id;
        const chapterRes = await fetch(
          `/api/manga/${encodeURIComponent(sample.provider)}/${encodeURIComponent(sample.id)}`
        );
        const chapterData = await chapterRes.json();
        const firstChapter = chapterData?.data?.chapters?.[0];
        if (firstChapter?.id) {
          payload.chapterId = firstChapter.id;
        }
      } else if (type === "MANGA_UPDATE") {
        payload.provider = sample.provider;
        payload.mangaId = sample.id;
      }

      const response = await fetch("/api/simulate-email-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`${type} email notification simulated`);
      } else {
        toast.error("Failed to simulate email notification");
      }
    } catch (error) {
      console.error("Email simulation error:", error);
      toast.error("Failed to simulate email notification");
    } finally {
      setIsLoading(false);
    }
  };

  const testBrowserNotification = async () => {
    setIsLoading(true);

    try {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Test Notification", {
            body: "This is a test notification from MangaTrack DevTools",
            icon: "/favicon.svg",
          });
          toast.success("Browser notification sent");
        } else if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification("Test Notification", {
              body: "This is a test notification from MangaTrack DevTools",
              icon: "/favicon.svg",
            });
            toast.success("Browser notification sent");
          } else {
            toast.error("Notification permission denied");
          }
        } else {
          toast.error("Notification permission denied");
        }
      } else {
        toast.error("Browser notifications not supported");
      }
    } catch (error) {
      console.error("Browser notification error:", error);
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

        {/* Sentry Testing removed */}

        {/* Email Notifications */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Email Notifications (Resend)
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => simulateEmailNotification("NEW_CHAPTER")}
            disabled={isLoading}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Simulate New Chapter Email"
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => simulateEmailNotification("MANGA_UPDATE")}
            disabled={isLoading}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Simulate Manga Update Email"
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => simulateEmailNotification("SYSTEM")}
            disabled={isLoading}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Simulate System Email"
            )}
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
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Test Browser Notification"
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
