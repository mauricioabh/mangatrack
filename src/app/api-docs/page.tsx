"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * API Documentation page using Swagger UI
 * Displays interactive API documentation for MangaTrack
 */
export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      try {
        const response = await fetch("/api/swagger");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Swagger spec: ${response.statusText}`
          );
        }
        const spec = await response.json();
        setSwaggerSpec(spec);
      } catch (err) {
        console.error("Error fetching Swagger spec:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load API documentation"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSwaggerSpec();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Documentation
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
            MangaTrack API Documentation
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Interactive API documentation for MangaTrack endpoints
          </p>
        </div>
        {swaggerSpec && <SwaggerUI spec={swaggerSpec} />}
      </div>
    </div>
  );
}
