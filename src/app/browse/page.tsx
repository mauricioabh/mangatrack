"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Compass, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatalogCover } from "@/components/manga/catalog-cover";
import type { BrowseCard, BrowseMode, BrowsePeriod } from "@/lib/browse";

const MODES: { id: BrowseMode; label: string }[] = [
  { id: "new", label: "New releases" },
  { id: "latest", label: "Latest updates" },
  { id: "trending", label: "Trending" },
];

const PERIODS: { id: BrowsePeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export default function BrowsePage() {
  const [mode, setMode] = useState<BrowseMode>("new");
  const [period, setPeriod] = useState<BrowsePeriod>("week");
  const [items, setItems] = useState<BrowseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ mode, period });
      const res = await fetch(`/api/browse?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setItems([]);
        setError(json.error ?? "Failed to load feed");
        return;
      }
      setItems(json.data?.items ?? []);
    } catch {
      setItems([]);
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [mode, period]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2.5 sm:mb-6">
          <Compass className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Browse
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            MangaDex feeds
          </Badge>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Button
              key={m.id}
              type="button"
              size="sm"
              variant={mode === m.id ? "default" : "outline"}
              onClick={() => setMode(m.id)}
              className={
                mode === m.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
              }
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Period
          </span>
          {PERIODS.map((p) => (
            <Button
              key={p.id}
              type="button"
              size="sm"
              variant={period === p.id ? "secondary" : "ghost"}
              onClick={() => setPeriod(p.id)}
              className="min-h-9"
            >
              {p.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg">
                <div className="aspect-[2/3] animate-pulse bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-dashed border-red-300 bg-white/70 p-8 text-center dark:border-red-800 dark:bg-slate-900/40">
            <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
            <Button type="button" onClick={() => void load()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/70 p-8 text-center dark:border-gray-600 dark:bg-slate-900/40">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No titles in this feed for the selected period.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group block overflow-hidden rounded-lg border border-blue-200/80 bg-white/70 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-blue-800/60 dark:bg-slate-900/40 dark:hover:border-blue-700"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {item.coverImage ? (
                    <CatalogCover
                      src={item.coverImage}
                      alt={item.title}
                      width={240}
                      height={360}
                      provider="mangadex"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2 pt-8">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-sm">
                      {item.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
