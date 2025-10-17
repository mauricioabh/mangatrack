"use client";

import { useEffect, useState } from "react";
import { MOCK_CONFIG } from "@/lib/mock-config";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMsw = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          // Check if mock data should be used
          const shouldUseMock = MOCK_CONFIG.getUseMockData();
          console.log("🔧 MSW Config Check:", {
            shouldUseMock,
            envVar: process.env.NEXT_PUBLIC_USE_MOCK,
            localStorage:
              typeof window !== "undefined"
                ? localStorage.getItem("use-mock-data")
                : "N/A",
            nodeEnv: process.env.NODE_ENV,
          });

          if (shouldUseMock) {
            const { worker } = await import("../mocks/browser");

            // Start the worker with more explicit configuration
            await worker.start({
              onUnhandledRequest: "bypass",
              quiet: false,
              serviceWorker: {
                url: "/mockServiceWorker.js",
              },
            });

            console.log(
              "🎭 MSW Mock Data Enabled - API calls will be intercepted"
            );

            // Wait a bit longer for the worker to be ready
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Add a test to verify MSW is working
            try {
              const testResponse = await fetch("/api/user/profile");
              const testData = await testResponse.json();
              console.log("🧪 MSW Test - User Profile Response:", testData);
            } catch (error) {
              console.error("🧪 MSW Test Failed:", error);
            }
          } else {
            console.log(
              "🗄️ Using Real Database Data - API calls will go to real endpoints"
            );
          }
        } catch (error) {
          console.error("Failed to initialize MSW:", error);
        } finally {
          setMswReady(true);
        }
      } else {
        setMswReady(true);
      }
    };

    // Add a small delay to prevent memory pressure during initial load
    const timeoutId = setTimeout(initMsw, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {!mswReady && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading MangaTrack...
            </p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
