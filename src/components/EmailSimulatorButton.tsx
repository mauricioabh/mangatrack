"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EmailSimulatorButton() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server side
  if (!isClient) {
    return null;
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const simulateEmailNotification = async (
    type: "NEW_CHAPTER" | "MANGA_UPDATE" | "SYSTEM"
  ) => {
    setIsLoading(true);

    try {
      // For demo purposes, we'll use mock IDs
      // In a real scenario, you'd get these from the current page context
      const mockMangaId = "clx1234567890abcdef"; // One Piece from mock data
      const mockChapterId = "chapter-1"; // First chapter

      const payload: Record<string, unknown> = { type };

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

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {/* Main Email Simulator Button */}
      <Button
        onClick={() => simulateEmailNotification("NEW_CHAPTER")}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-md transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            📧 Simulate Email
          </>
        )}
      </Button>

      {/* Quick Action Buttons */}
      <div className="flex gap-1">
        <Button
          onClick={() => simulateEmailNotification("NEW_CHAPTER")}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 text-xs px-2"
          title="Simulate New Chapter Email"
        >
          📖 Chapter
        </Button>

        <Button
          onClick={() => simulateEmailNotification("MANGA_UPDATE")}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 text-xs px-2"
          title="Simulate Manga Update Email"
        >
          📚 Update
        </Button>

        <Button
          onClick={() => simulateEmailNotification("SYSTEM")}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs px-2"
          title="Simulate System Email"
        >
          🔔 System
        </Button>
      </div>
    </div>
  );
}
