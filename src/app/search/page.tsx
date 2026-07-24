"use client";

import { useState, useEffect, useRef } from "react";
import { Search, BookOpen, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { CatalogCover } from "@/components/manga/catalog-cover";
import { mangaApiPath, mangaPath } from "@/lib/consumet/ids";

/** Fallback until API returns allowlist — keeps the filter visible on first paint */
const DEFAULT_PROVIDERS = ["mangahere", "mangapill"];

interface Manga {
  id: string;
  provider: string;
  title: string;
  description?: string;
  coverImage?: string;
  coverReferer?: string;
  status: string;
  genres: string[];
  author?: string;
  chapterCount?: number | null;
  chapterCountLoading?: boolean;
}

const CHAPTER_COUNT_CONCURRENCY = 3;

async function fetchChapterCount(
  provider: string,
  id: string
): Promise<number | null> {
  try {
    // Prefer dedicated count endpoint; fall back to manga detail (same Consumet info).
    const countUrl = `/api/manga/chapter-count?provider=${encodeURIComponent(provider)}&id=${encodeURIComponent(id)}`;
    const res = await fetch(countUrl);
    if (res.ok) {
      const json = await res.json();
      if (json.success && typeof json.data?.chapterCount === "number") {
        return json.data.chapterCount;
      }
    }

    const detailRes = await fetch(mangaApiPath(provider, id));
    if (!detailRes.ok) return null;
    const detailJson = await detailRes.json();
    const chapters = detailJson?.data?.chapters;
    if (detailJson.success && Array.isArray(chapters)) {
      return chapters.length;
    }
    return null;
  } catch {
    return null;
  }
}

function ChapterCountLabel({
  loading,
  count,
}: {
  loading?: boolean;
  count?: number | null;
}) {
  if (loading) return <>…</>;
  if (count != null) return <>{count} caps</>;
  return <>N/D</>;
}

async function enrichChapterCounts(
  items: Manga[],
  onBatch: (updates: Map<string, number | null>) => void
): Promise<void> {
  const queue = [...items];
  let index = 0;

  async function worker() {
    while (index < queue.length) {
      const current = index++;
      const item = queue[current];
      const key = `${item.provider}:${item.id}`;
      const count = await fetchChapterCount(item.provider, item.id);
      onBatch(new Map([[key, count]]));
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(CHAPTER_COUNT_CONCURRENCY, queue.length) },
      () => worker()
    )
  );
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [providerNotices, setProviderNotices] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  /** Empty = all allowlisted providers */
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [exactMatch, setExactMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const enrichGeneration = useRef(0);
  const [filtersReady, setFiltersReady] = useState(false);

  const applySearchResults = (results: Manga[]) => {
    const generation = ++enrichGeneration.current;
    const withLoading = results.map((m) => ({
      ...m,
      chapterCount: null,
      chapterCountLoading: true,
    }));
    setMangas(withLoading);

    void enrichChapterCounts(withLoading, (updates) => {
      if (generation !== enrichGeneration.current) return;
      setMangas((prev) =>
        prev.map((m) => {
          const key = `${m.provider}:${m.id}`;
          if (!updates.has(key)) return m;
          return {
            ...m,
            chapterCount: updates.get(key) ?? null,
            chapterCountLoading: false,
          };
        })
      );
    });
  };

  const providersParam = (): string | undefined => {
    if (selectedProviders.length === 0) return undefined;
    if (
      availableProviders.length > 0 &&
      availableProviders.every((p) => selectedProviders.includes(p))
    ) {
      return undefined;
    }
    return selectedProviders.join(",");
  };

  const buildSearchParams = (query: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.append("query", query);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (genreFilter !== "all") params.append("genre", genreFilter);
    if (exactMatch) params.append("match", "exact");
    const providers = providersParam();
    if (providers) params.append("providers", providers);
    return params;
  };

  const ingestProviderMeta = (data: {
    availableProviders?: string[];
    providers?: { error?: string; provider: string }[];
  }) => {
    if (Array.isArray(data.availableProviders) && data.availableProviders.length) {
      setAvailableProviders(data.availableProviders);
    }
    const notices = (data.providers ?? [])
      .filter((p) => p.error)
      .map((p) => `${p.provider}: unavailable`);
    setProviderNotices(notices);
  };

  const isProviderActive = (provider: string) =>
    selectedProviders.length === 0 || selectedProviders.includes(provider);

  const providerOptions =
    availableProviders.length > 0 ? availableProviders : DEFAULT_PROVIDERS;

  const providerFilterLabel = () => {
    if (selectedProviders.length === 0) return "All Providers";
    if (selectedProviders.length === 1) {
      return selectedProviders[0];
    }
    return `${selectedProviders.length} providers`;
  };

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) => {
      const base =
        prev.length === 0
          ? providerOptions.length > 0
            ? [...providerOptions]
            : [provider]
          : [...prev];
      if (base.includes(provider)) {
        return base.filter((p) => p !== provider);
      }
      const next = [...base, provider];
      if (
        providerOptions.length > 0 &&
        providerOptions.every((p) => next.includes(p))
      ) {
        return [];
      }
      return next;
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const params = buildSearchParams(searchQuery);
      const response = await fetch(`/api/manga/search?${params}`);
      const data = await response.json();

      if (data.success) {
        applySearchResults(data.data);
        ingestProviderMeta(data);
      } else {
        setMangas([]);
        setSearchError(data.error ?? "Search failed");
        setProviderNotices([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Search failed");
      setMangas([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFiltersAndBrowse = async () => {
    setSearchQuery("");
    setStatusFilter("all");
    setGenreFilter("all");
    setSelectedProviders([]);
    setExactMatch(false);
    setLoading(true);
    try {
      const response = await fetch("/api/manga/search");
      const data = await response.json();
      if (data.success) {
        applySearchResults(data.data);
        ingestProviderMeta(data);
      }
    } catch (error) {
      console.error("Error loading manga:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query or filters change
  useEffect(() => {
    if (!filtersReady) return;

    const performSearch = async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const params = buildSearchParams(debouncedQuery);
        const response = await fetch(`/api/manga/search?${params}`);
        const data = await response.json();

        if (data.success) {
          applySearchResults(data.data);
          ingestProviderMeta(data);
        } else {
          setMangas([]);
          setSearchError(data.error ?? "Search failed");
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filtersReady,
    debouncedQuery,
    statusFilter,
    genreFilter,
    exactMatch,
    selectedProviders,
  ]);

  // Handle URL ?q= before enabling search effect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
      setDebouncedQuery(queryParam);
    }
    setFiltersReady(true);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="mb-2 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 sm:text-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Amazing Manga
          </motion.h1>
          <motion.p
            className="mb-6 text-base text-gray-600 dark:text-gray-300 sm:mb-8 sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Find your next favorite series from our extensive collection
          </motion.p>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Search Input */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <motion.div
                className="relative min-w-0 flex-1"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-blue-500" />
                <Input
                  placeholder="Search titles, authors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-11 border-2 border-blue-200 bg-white/80 pl-12 text-base backdrop-blur-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:shadow-xl focus:ring-4 focus:ring-blue-500/20 dark:border-blue-800 dark:bg-gray-800/80 dark:hover:border-blue-700 dark:focus:border-blue-600 sm:h-12 sm:text-lg"
                />
              </motion.div>
              <div className="flex gap-2 sm:gap-4">
                <motion.div
                  className="flex-1 sm:flex-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-11 w-full border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-8"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Search className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Search
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.div
                  className="flex-1 sm:flex-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={() => {
                      void resetFiltersAndBrowse();
                    }}
                    variant="outline"
                    className="h-11 w-full border-2 border-emerald-200 px-3 text-emerald-600 transition-all duration-300 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 sm:h-12 sm:px-6"
                  >
                    <Star className="mr-1 h-5 w-5 sm:mr-2" />
                    <span className="truncate">Browse All</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Filters — stacked on narrow PWA viewports */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <motion.div
                  className="min-w-0 flex-1 sm:flex-none"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 w-full border-2 border-blue-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-300 dark:border-blue-800 dark:bg-gray-800/80 dark:hover:border-blue-700 sm:h-12 sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-800">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="HIATUS">Hiatus</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  className="min-w-0 flex-1 sm:flex-none"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="h-11 w-full border-2 border-purple-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-purple-300 dark:border-purple-800 dark:bg-gray-800/80 dark:hover:border-purple-700 sm:h-12 sm:w-48">
                      <SelectValue placeholder="Filter by genre" />
                    </SelectTrigger>
                    <SelectContent className="border-purple-200 bg-white dark:border-purple-800 dark:bg-gray-800">
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="Action">Action</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Drama">Drama</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                      <SelectItem value="Slice of Life">Slice of Life</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  className="min-w-0 flex-1 sm:flex-none"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-between border-2 border-amber-200 bg-white/80 px-3 text-left font-normal capitalize backdrop-blur-sm hover:border-amber-300 dark:border-amber-800 dark:bg-gray-800/80 dark:hover:border-amber-700 sm:h-12 sm:w-52"
                        aria-label="Filter by provider"
                      >
                        <span className="truncate">{providerFilterLabel()}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[min(100vw-2rem,16rem)] border-amber-200 bg-white dark:border-amber-800 dark:bg-gray-800"
                    >
                      <DropdownMenuLabel>Providers</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={selectedProviders.length === 0}
                        onCheckedChange={() => setSelectedProviders([])}
                        onSelect={(e) => e.preventDefault()}
                        className="min-h-11 capitalize"
                      >
                        All providers
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {providerOptions.map((provider) => (
                        <DropdownMenuCheckboxItem
                          key={provider}
                          checked={isProviderActive(provider)}
                          onCheckedChange={() => toggleProvider(provider)}
                          onSelect={(e) => e.preventDefault()}
                          className="min-h-11 capitalize"
                        >
                          {provider}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>

                <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border-2 border-teal-200 bg-white/80 px-3 py-2 backdrop-blur-sm dark:border-teal-800 dark:bg-gray-800/80 sm:min-h-12 sm:justify-start">
                  <Label
                    htmlFor="exact-match"
                    className="cursor-pointer text-sm text-teal-800 dark:text-teal-200"
                  >
                    Exact phrase
                  </Label>
                  <Switch
                    id="exact-match"
                    checked={exactMatch}
                    onCheckedChange={setExactMatch}
                    className="h-6 w-11 data-[state=checked]:bg-teal-600"
                    aria-label="Exact phrase match"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: wrap a query in quotes for exact match, e.g.{" "}
                <span className="font-mono">&quot;demon slayer&quot;</span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Results */}
        {(providerNotices.length > 0 || searchError) && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {searchError && <p>{searchError}</p>}
            {providerNotices.length > 0 && (
              <p>
                Some providers unavailable: {providerNotices.join("; ")}. Showing
                results from available sources.
              </p>
            )}
          </div>
        )}
        {mangas.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
          <motion.h2
              className="mb-4 break-words bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 sm:mb-6 sm:text-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {searchQuery.trim()
                ? `Search Results for "${searchQuery}" (${mangas.length})`
                : `Popular Manga (${mangas.length})`}
            </motion.h2>
            <motion.div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {mangas.map((manga, index) => (
                <motion.div
                  key={`${manga.provider}:${manga.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                  className="group h-full"
                >
                  <Link
                    href={mangaPath(manga.provider, manga.id)}
                    className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
                  >
                    <Card className="h-full cursor-pointer gap-3 border-2 border-transparent bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 py-3 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:via-purple-50 group-hover:to-pink-50 dark:group-hover:from-blue-900/30 dark:group-hover:via-purple-900/30 dark:group-hover:to-pink-900/30">
                      <CardHeader className="shrink-0 space-y-0 px-3 pb-0">
                        <motion.div
                          className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg dark:from-gray-700 dark:to-gray-600 group-hover:shadow-xl transition-all duration-300"
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.3 }}
                        >
                          {manga.coverImage && (
                            <CatalogCover
                              src={manga.coverImage}
                              alt={manga.title}
                              width={140}
                              height={210}
                              provider={manga.provider}
                              referer={manga.coverReferer}
                              className="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          )}
                        </motion.div>
                        <motion.div
                          className="mt-2"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardTitle className="min-h-[2.5rem] text-sm line-clamp-2 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 dark:group-hover:from-blue-300 dark:group-hover:via-purple-300 dark:group-hover:to-pink-300 transition-all duration-300">
                            {manga.title}
                          </CardTitle>
                        </motion.div>
                        {manga.author && (
                          <motion.p
                            className="mt-0.5 flex min-h-4 items-center text-xs text-gray-600 line-clamp-1 dark:text-gray-400"
                            title={`by ${manga.author}`}
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <BookOpen className="mr-1 h-3 w-3 shrink-0 text-blue-500" />
                            <span className="truncate">by {manga.author}</span>
                          </motion.p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <Badge
                            variant="outline"
                            className="border-amber-200 text-[10px] capitalize text-amber-800 dark:border-amber-700 dark:text-amber-300"
                          >
                            {manga.provider}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 text-[10px] text-green-800 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300"
                          >
                            {manga.status}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-sky-600 text-[10px] font-semibold tabular-nums text-white hover:bg-sky-600 dark:bg-sky-500"
                            title="Capítulos disponibles en este provider"
                            data-testid="chapter-count-badge-row"
                          >
                            <ChapterCountLabel
                              loading={manga.chapterCountLoading}
                              count={manga.chapterCount}
                            />
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pt-0 pb-1">
                        <motion.div
                          className="min-h-[2.5rem]"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardDescription className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                            {manga.description ?? ""}
                          </CardDescription>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* No Results */}
        {mangas.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No manga found" : "No manga available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Try adjusting your filters to see more results"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
