"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, BookOpen, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { CatalogCover } from "@/components/manga/catalog-cover";
import { BookLoadingMark } from "@/components/loading/book-loading-mark";
import { mangaApiPath, mangaPath } from "@/lib/consumet/ids";

/** Fallback until API returns allowlist — keeps the filter visible on first paint */
const DEFAULT_PROVIDERS = ["mangahere", "mangapill", "mangadex"];

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

function mangaKey(m: { provider: string; id: string }) {
  return `${m.provider}:${m.id}`;
}

function appendUnique(prev: Manga[], next: Manga[]): Manga[] {
  const seen = new Set(prev.map(mangaKey));
  const added: Manga[] = [];
  for (const item of next) {
    const key = mangaKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(item);
  }
  return added.length === 0 ? prev : [...prev, ...added];
}

async function fetchChapterCount(
  provider: string,
  id: string
): Promise<number | null> {
  try {
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const enrichGeneration = useRef(0);
  const searchGeneration = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const bootstrappedRef = useRef(false);
  const filtersRef = useRef({
    statusFilter,
    genreFilter,
    exactMatch,
    selectedProviders,
    availableProviders,
  });
  filtersRef.current = {
    statusFilter,
    genreFilter,
    exactMatch,
    selectedProviders,
    availableProviders,
  };

  const applySearchResults = (results: Manga[], mode: "replace" | "append") => {
    const generation = ++enrichGeneration.current;
    const withLoading = results.map((m) => ({
      ...m,
      chapterCount: null as number | null,
      chapterCountLoading: true,
    }));
    if (mode === "replace") {
      setMangas(withLoading);
    } else {
      setMangas((prev) => appendUnique(prev, withLoading));
    }

    void enrichChapterCounts(withLoading, (updates) => {
      if (generation !== enrichGeneration.current) return;
      setMangas((prev) =>
        prev.map((m) => {
          const key = mangaKey(m);
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

  const buildSearchParams = (query: string, pageNum: number) => {
    const {
      statusFilter: status,
      genreFilter: genre,
      exactMatch: exact,
      selectedProviders: selected,
      availableProviders: available,
    } = filtersRef.current;
    const params = new URLSearchParams();
    if (query.trim()) params.append("query", query);
    if (status !== "all") params.append("status", status);
    if (genre !== "all") params.append("genre", genre);
    if (exact) params.append("match", "exact");
    if (selected.length > 0) {
      const allSelected =
        available.length > 0 && available.every((p) => selected.includes(p));
      if (!allSelected) {
        params.append("providers", selected.join(","));
      }
    }
    if (pageNum > 1) params.append("page", String(pageNum));
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

  const runSearch = useCallback(
    async (query: string, pageNum: number, mode: "replace" | "append") => {
      if (mode === "replace") {
        abortRef.current?.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const generation =
        mode === "replace"
          ? ++searchGeneration.current
          : searchGeneration.current;

      if (mode === "replace") {
        setLoading(true);
        setLoadingMore(false);
        setSearchError(null);
        setHasSearched(true);
        setPage(1);
        setHasMore(false);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = buildSearchParams(query, pageNum);
        const response = await fetch(`/api/manga/search?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (generation !== searchGeneration.current) return;

        if (data.success) {
          applySearchResults(data.data ?? [], mode);
          ingestProviderMeta(data);
          setPage(pageNum);
          setHasMore(Boolean(data.pagination?.hasMore));
          if (mode === "replace" && (!data.data || data.data.length === 0)) {
            setHasMore(false);
          }
        } else if (mode === "replace") {
          setMangas([]);
          setSearchError(data.error ?? "Search failed");
          setProviderNotices([]);
          setHasMore(false);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (generation !== searchGeneration.current) return;
        console.error("Search error:", error);
        if (mode === "replace") {
          setSearchError("Search failed");
          setMangas([]);
          setHasMore(false);
        }
      } finally {
        if (generation === searchGeneration.current) {
          if (mode === "replace") setLoading(false);
          else setLoadingMore(false);
        }
      }
    },
    []
  );

  const handleSearch = () => {
    void runSearch(searchQuery, 1, "replace");
  };

  const activeFilterCount = () => {
    let count = 0;
    if (statusFilter !== "all") count += 1;
    if (genreFilter !== "all") count += 1;
    if (selectedProviders.length > 0) count += 1;
    if (exactMatch) count += 1;
    return count;
  };

  const clearFiltersAndQuery = () => {
    abortRef.current?.abort();
    searchGeneration.current += 1;
    setSearchQuery("");
    setStatusFilter("all");
    setGenreFilter("all");
    setSelectedProviders([]);
    setExactMatch(false);
    setFiltersOpen(false);
    setMangas([]);
    setHasSearched(false);
    setHasMore(false);
    setPage(1);
    setSearchError(null);
    setProviderNotices([]);
    setLoading(false);
    setLoadingMore(false);
  };

  // Initial ?q= deep link — one search on mount
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
      void runSearch(queryParam, 1, "replace");
    }
  }, [runSearch]);

  // Infinite scroll sentinel
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasSearched || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading || loadingMore) return;
        if (!hasMore) return;
        void runSearch(searchQuery, page + 1, "append");
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    hasSearched,
    hasMore,
    loading,
    loadingMore,
    page,
    searchQuery,
    runSearch,
  ]);

  const filterCount = activeFilterCount();
  const chromeLocked = loading;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !chromeLocked) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search titles, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chromeLocked}
              className="h-11 min-w-0 flex-1 border-2 border-blue-200 bg-white/80 text-base backdrop-blur-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:shadow-lg focus:ring-4 focus:ring-blue-500/20 dark:border-blue-800 dark:bg-gray-800/80 dark:hover:border-blue-700 dark:focus:border-blue-600 sm:h-12"
              aria-label="Search manga"
            />
            <Button
              onClick={handleSearch}
              disabled={chromeLocked}
              size="icon"
              className="h-11 w-11 shrink-0 border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
              aria-label="Search"
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
                <Search className="h-5 w-5" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFiltersOpen(true)}
              disabled={chromeLocked}
              className="relative h-11 w-11 shrink-0 border-2 border-blue-200 bg-white/80 dark:border-blue-800 dark:bg-gray-800/80 sm:h-12 sm:w-12"
              aria-label="Filters"
              aria-expanded={filtersOpen}
              aria-haspopup="dialog"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {filterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {filterCount}
                </span>
              )}
            </Button>
          </div>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto rounded-t-2xl"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Adjust filters, then press Search to apply.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4 pb-2">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    disabled={chromeLocked}
                  >
                    <SelectTrigger id="status-filter" className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="HIATUS">Hiatus</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre-filter">Genre</Label>
                  <Select
                    value={genreFilter}
                    onValueChange={setGenreFilter}
                    disabled={chromeLocked}
                  >
                    <SelectTrigger id="genre-filter" className="w-full">
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="Action">Action</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Drama">Drama</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                      <SelectItem value="Horror">Horror</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                      <SelectItem value="Slice of Life">Slice of Life</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Supernatural">Supernatural</SelectItem>
                      <SelectItem value="Thriller">Thriller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Providers</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={chromeLocked}
                        className="h-11 w-full justify-between"
                      >
                        <span className="truncate">{providerFilterLabel()}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Providers</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {providerOptions.map((provider) => (
                        <DropdownMenuCheckboxItem
                          key={provider}
                          checked={isProviderActive(provider)}
                          onCheckedChange={() => toggleProvider(provider)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {provider}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="min-w-0">
                    <Label htmlFor="exact-match" className="text-sm font-medium">
                      Exact phrase
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Match the full query in the title
                    </p>
                  </div>
                  <Switch
                    id="exact-match"
                    checked={exactMatch}
                    onCheckedChange={setExactMatch}
                    disabled={chromeLocked}
                    className="h-6 w-11 data-[state=checked]:bg-teal-600"
                    aria-label="Exact phrase match"
                  />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tip: wrap a query in quotes for exact match, e.g.{" "}
                  <span className="font-mono">&quot;demon slayer&quot;</span>
                </p>
              </div>

              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFiltersAndQuery}
                  disabled={chromeLocked}
                  className="w-full sm:w-auto"
                >
                  Clear
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </motion.div>

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

        {loading && (
          <div
            className="mb-8 flex flex-col items-center justify-center py-16"
            aria-busy="true"
            aria-label="Searching"
          >
            <BookLoadingMark size="lg" tone="dark" />
          </div>
        )}

        {mangas.length > 0 && !loading && (
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
                ? `Search Results for "${searchQuery}"`
                : "Search Results"}
            </motion.h2>
            <motion.div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {mangas.map((manga, index) => (
                <motion.div
                  key={`${manga.provider}:${manga.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(index, 12) * 0.05,
                  }}
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
                    className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <Card className="h-full cursor-pointer gap-0 border-2 border-transparent bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 py-3 transition-all duration-500 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:via-purple-50 group-hover:to-pink-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 dark:hover:border-blue-600 dark:hover:shadow-blue-400/20 dark:group-hover:from-blue-900/30 dark:group-hover:via-purple-900/30 dark:group-hover:to-pink-900/30">
                      <CardHeader className="shrink-0 space-y-0 gap-0 px-3 pb-0">
                        <motion.div
                          className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg transition-all duration-300 group-hover:shadow-xl dark:from-gray-700 dark:to-gray-600"
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CatalogCover
                            src={manga.coverImage}
                            alt={manga.title}
                            title={manga.title}
                            width={140}
                            height={210}
                            provider={manga.provider}
                            referer={manga.coverReferer}
                            className="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </motion.div>
                        <motion.div className="mt-2 min-h-0">
                          <CardTitle
                            className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white"
                            title={manga.title}
                          >
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
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div
              ref={sentinelRef}
              className="flex min-h-16 flex-col items-center justify-center py-8"
            >
              {loadingMore && <BookLoadingMark size="md" tone="dark" />}
              {!loading && !loadingMore && hasSearched && !hasMore && (
                <p className="text-sm text-muted-foreground">No more results</p>
              )}
            </div>
          </motion.div>
        )}

        {hasSearched && mangas.length === 0 && !loading && (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No manga found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or filters, then press Search
            </p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              Search manga
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enter a title and press Search
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
