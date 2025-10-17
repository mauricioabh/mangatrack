"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bug, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

export function SentryTestButton() {
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

  return (
    <div className="fixed bottom-40 right-4 z-50 flex flex-col gap-2">
      {/* Main Sentry Test Button */}
      <Button
        onClick={() => triggerSentryError("client")}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-md transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Bug className="h-4 w-4 mr-2" />
            🐛 Test Sentry
          </>
        )}
      </Button>

      {/* Quick Action Buttons */}
      <div className="flex gap-1">
        <Button
          onClick={() => triggerSentryError("client")}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-xs px-2"
          title="Test Client Error"
        >
          💻 Client
        </Button>

        <Button
          onClick={() => triggerSentryError("server")}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 text-xs px-2"
          title="Test Server Error"
        >
          🖥️ Server
        </Button>

        <Button
          onClick={() => triggerSentryError("api")}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 text-xs px-2"
          title="Test API Error"
        >
          🔌 API
        </Button>
      </div>
    </div>
  );
}
