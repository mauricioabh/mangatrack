"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, TestTube } from "lucide-react";
import { MOCK_CONFIG } from "@/lib/mock-config";

export function MockDataToggle() {
  const [useMockData, setUseMockData] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUseMockData(MOCK_CONFIG.getUseMockData());
  }, []);

  const toggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    MOCK_CONFIG.setUseMockData(newValue);

    // Reload the page to apply changes
    window.location.reload();
  };

  // Don't render on server side
  if (!isClient) {
    return null;
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={toggleMockData}
        variant={useMockData ? "default" : "outline"}
        size="sm"
        className={`transition-all duration-300 ${
          useMockData
            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-md"
        }`}
      >
        {useMockData ? (
          <>
            <TestTube className="h-4 w-4 mr-2" />
            Mock Data ON
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-2" />
            Real Data
          </>
        )}
      </Button>
    </div>
  );
}
