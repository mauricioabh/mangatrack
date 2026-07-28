"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Settings2,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getChapterNeighbors } from "@/lib/consumet/mappers";
import {
  chapterApiPath,
  decodeExternalId,
  mangaPath,
  readerPath,
} from "@/lib/consumet/ids";
import { warmChapterPages } from "@/lib/consumet/reader-warm";
import { BookLoadingMark } from "@/components/loading/book-loading-mark";
import { cn } from "@/lib/utils";

const BRIGHTNESS_STORAGE_KEY = "mangatrack.reader.brightness";
const BRIGHTNESS_MIN = 0.2;
const BRIGHTNESS_MAX = 1;
const TAP_MOVE_THRESHOLD_PX = 10;
const LOADING_SKELETON_COUNT = 3;
/** Warm/cache usually finishes before this — then we never show the book. */
const COLD_BOOK_MS = 1600;
/** After entertaining with the book, return focus to page skeletons. */
const COLD_SKELETON_MS = 3400;

type LoadingStage = "skeleton" | "cold-book" | "cold-skeleton";

interface ReaderPageProps {
  params: Promise<{
    provider: string;
    chapterId: string;
  }>;
}

interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  pages: string[];
}

interface Manga {
  id: string;
  title: string;
  provider?: string;
}

function clampBrightness(value: number): number {
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, value));
}

function readStoredBrightness(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = window.localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (raw == null) return 1;
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed)) return 1;
    return clampBrightness(parsed);
  } catch {
    return 1;
  }
}

/** Prefer history.back when a same-origin prior entry is likely; else false. */
function canUseHistoryBack(): boolean {
  if (typeof window === "undefined") return false;
  if (window.history.length <= 1) return false;
  const referrer = document.referrer;
  if (!referrer) return true;
  try {
    return new URL(referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full animate-pulse rounded-sm bg-zinc-800",
        className ?? "mb-4 h-[min(70vh,900px)]"
      )}
      aria-hidden
    />
  );
}

function ReaderScanImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full">
      {!loaded ? <PageSkeleton className="h-[min(70vh,900px)]" /> : null}
      <img
        src={src}
        alt={alt}
        className={cn(
          className,
          !loaded && "pointer-events-none absolute inset-x-0 top-0 opacity-0"
        )}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [provider, setProvider] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("skeleton");
  const [readingMode, setReadingMode] = useState("vertical"); // vertical, horizontal
  const [imageFit, setImageFit] = useState("width"); // width, height, original
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const markedChapterIdRef = useRef<string | null>(null);
  const lastPageObserverRef = useRef<IntersectionObserver | null>(null);
  const userEngagedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);

  useEffect(() => {
    setBrightness(readStoredBrightness());
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingStage("skeleton");
      return;
    }

    setLoadingStage("skeleton");
    const bookTimer = window.setTimeout(() => {
      setLoadingStage("cold-book");
    }, COLD_BOOK_MS);
    const skeletonTimer = window.setTimeout(() => {
      setLoadingStage("cold-skeleton");
    }, COLD_SKELETON_MS);

    return () => {
      window.clearTimeout(bookTimer);
      window.clearTimeout(skeletonTimer);
    };
  }, [loading]);

  const persistBrightness = useCallback((value: number) => {
    const next = clampBrightness(value);
    setBrightness(next);
    try {
      window.localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(next));
    } catch {
      // ignore quota / private mode
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const resolved = await params;
      const p = decodeURIComponent(resolved.provider);
      const chapterId = decodeExternalId(resolved.chapterId);
      const mangaIdParam =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("mangaId") ??
            undefined
          : undefined;
      setProvider(p);

      // Kick off meta in parallel; only wait on pages to show scans
      const pagesPromise = fetch(
        chapterApiPath(p, chapterId, mangaIdParam, "pages")
      );
      const metaPromise = fetch(
        chapterApiPath(p, chapterId, mangaIdParam, "meta")
      );

      const pagesRes = await pagesPromise;
      const pagesData = await pagesRes.json();

      if (!pagesData.success || !pagesData.chapter?.pages?.length) {
        console.error("Chapter pages fetch failed:", pagesData.error);
        setLoadError(pagesData.error ?? "Failed to load chapter");
        setChapter(null);
        setManga(null);
        setChapters([]);
        return;
      }

      setChapter({
        id: pagesData.chapter.id ?? chapterId,
        title: pagesData.chapter.title ?? "",
        chapterNumber: pagesData.chapter.chapterNumber ?? 0,
        pages: pagesData.chapter.pages,
      });
      if (mangaIdParam) {
        setManga((prev) => prev ?? { id: mangaIdParam, title: "", provider: p });
      }
      setLoading(false);

      try {
        const metaRes = await metaPromise;
        const metaData = await metaRes.json();
        if (!metaData.success) return;
        if (metaData.manga) setManga(metaData.manga);
        if (Array.isArray(metaData.chapters)) setChapters(metaData.chapters);
        if (metaData.chapter) {
          setChapter((prev) =>
            prev
              ? {
                  ...prev,
                  title: metaData.chapter.title || prev.title,
                  chapterNumber:
                    metaData.chapter.chapterNumber || prev.chapterNumber,
                }
              : prev
          );
        }
      } catch (metaError) {
        console.error("Chapter meta fetch failed:", metaError);
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
      setLoadError("Failed to load chapter");
      setChapter(null);
      setManga(null);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setShowCompleteModal(false);
    setChromeVisible(true);
    setSettingsOpen(false);
    markedChapterIdRef.current = null;
    userEngagedRef.current = false;
  }, [chapter?.id]);

  useEffect(() => {
    const engage = () => {
      userEngagedRef.current = true;
    };
    window.addEventListener("scroll", engage, { passive: true });
    window.addEventListener("wheel", engage, { passive: true });
    window.addEventListener("touchstart", engage, { passive: true });
    window.addEventListener("keydown", engage);
    return () => {
      window.removeEventListener("scroll", engage);
      window.removeEventListener("wheel", engage);
      window.removeEventListener("touchstart", engage);
      window.removeEventListener("keydown", engage);
    };
  }, [chapter?.id]);

  const markChapterAsRead = useCallback(
    async (options?: { showCompletionModal?: boolean }) => {
      if (!chapter || !manga?.id) return false;
      if (markedChapterIdRef.current === chapter.id) {
        if (options?.showCompletionModal) {
          setShowCompleteModal(true);
        }
        return true;
      }

      markedChapterIdRef.current = chapter.id;

      try {
        const response = await fetch("/api/reading-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            chapterId: chapter.id,
            mangaId: manga.id,
          }),
        });
        if (!response.ok) {
          markedChapterIdRef.current = null;
          return false;
        }
        if (options?.showCompletionModal) {
          setShowCompleteModal(true);
        }
        return true;
      } catch (error) {
        markedChapterIdRef.current = null;
        console.error("Error marking as read:", error);
        return false;
      }
    },
    [chapter, manga?.id, provider]
  );

  const handlePageChange = (direction: "prev" | "next") => {
    if (!chapter) return;

    if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < chapter.pages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (nextPage === chapter.pages.length - 1) {
        userEngagedRef.current = true;
        void markChapterAsRead({ showCompletionModal: true });
      }
    }
  };

  const handleReaderBack = () => {
    const fallback =
      manga?.id != null
        ? mangaPath(provider, manga.id)
        : "/dashboard";
    if (canUseHistoryBack()) {
      router.back();
      return;
    }
    router.push(fallback);
  };

  const handleChapterChange = (direction: "prev" | "next") => {
    if (!chapter) return;

    const goNext = async () => {
      if (direction === "next") {
        userEngagedRef.current = true;
        await markChapterAsRead({ showCompletionModal: false });
      }
      const { next, previous } = getChapterNeighbors(chapters, chapter.id);
      const target = direction === "next" ? next : previous;
      if (target) {
        warmChapterPages(provider, target.id, manga?.id);
        window.location.replace(readerPath(provider, target.id, manga?.id));
      }
    };

    void goNext();
  };

  useEffect(() => {
    lastPageObserverRef.current?.disconnect();
    lastPageObserverRef.current = null;

    if (readingMode !== "vertical" || !chapter || chapter.pages.length === 0) {
      return;
    }

    const lastPageEl = document.getElementById("reader-last-page");
    if (!lastPageEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          userEngagedRef.current &&
          entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
        ) {
          void markChapterAsRead({ showCompletionModal: true });
        }
      },
      { threshold: [0.5, 0.9] }
    );
    observer.observe(lastPageEl);
    lastPageObserverRef.current = observer;

    return () => observer.disconnect();
  }, [readingMode, chapter, markChapterAsRead]);

  const onReaderPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (settingsOpen || showCompleteModal) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pointerMovedRef.current = false;
  };

  const onReaderPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;
    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);
    if (dx > TAP_MOVE_THRESHOLD_PX || dy > TAP_MOVE_THRESHOLD_PX) {
      pointerMovedRef.current = true;
    }
  };

  const onReaderPointerUp = () => {
    const wasTap =
      pointerStartRef.current !== null && !pointerMovedRef.current;
    pointerStartRef.current = null;
    pointerMovedRef.current = false;
    if (!wasTap || settingsOpen || showCompleteModal) return;
    setChromeVisible((visible) => !visible);
  };

  if (loading) {
    const showBook =
      loadingStage === "cold-book" || loadingStage === "cold-skeleton";
    const bookHero = loadingStage === "cold-book";
    const showSkeletons = loadingStage !== "cold-book";

    return (
      <div className="relative min-h-screen bg-black text-white">
        <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center gap-3 px-2 py-3 sm:px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReaderBack}
              className="shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-40 max-w-full animate-pulse rounded bg-zinc-700 sm:w-56" />
              <div className="h-3 w-28 max-w-full animate-pulse rounded bg-zinc-800 sm:w-36" />
            </div>
          </div>
        </header>
        <main
          className="pt-16 sm:pt-20"
          aria-busy="true"
          aria-label="Loading chapter"
        >
          {showBook ? (
            <div
              className={cn(
                "mx-auto flex max-w-4xl flex-col items-center px-4 text-center transition-all duration-500",
                bookHero ? "pb-6 pt-16 sm:pt-24" : "pb-2 pt-8"
              )}
              aria-busy="true"
              aria-label="Loading chapter"
            >
              <BookLoadingMark size={bookHero ? "lg" : "md"} tone="light" />
            </div>
          ) : null}

          {showSkeletons ? (
            <div
              className={cn(
                "mx-auto max-w-4xl px-4 py-8 transition-opacity duration-500",
                loadingStage === "cold-skeleton" ? "opacity-80" : "opacity-100"
              )}
            >
              {Array.from({ length: LOADING_SKELETON_COUNT }, (_, index) => (
                <PageSkeleton key={index} />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">Could not load chapter</h1>
          <p className="text-gray-400 mb-6">
            {loadError ||
              "The chapter you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="border-gray-600 text-white"
              onClick={() => void fetchData()}
            >
              Retry
            </Button>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Manga
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { next: nextChapter, previous: previousChapter } =
    getChapterNeighbors(chapters, chapter.id);
  const hasNextChapter = nextChapter !== null;
  const hasPrevChapter = previousChapter !== null;
  const dimOpacity = 1 - brightness;
  const mangaTitle = manga?.title?.trim() ? manga.title : "Loading…";
  const chapterLabel =
    chapter.chapterNumber > 0
      ? `Ch. ${chapter.chapterNumber}${chapter.title ? `: ${chapter.title}` : ""}`
      : chapter.title || "Loading chapter…";

  return (
    <div className="relative min-h-screen bg-black text-white">
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 border-b-4 border-white/20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl backdrop-blur-sm transition-transform duration-200 dark:border-gray-800/20 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700",
          chromeVisible ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReaderBack}
                className="shrink-0 border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 dark:border-gray-700/50 dark:bg-gray-800/30 dark:text-white dark:hover:bg-gray-700/40 sm:hover:scale-105 sm:hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white drop-shadow-lg sm:max-w-md sm:text-lg">
                  {mangaTitle}
                </h1>
                <p className="truncate text-xs text-white/80 drop-shadow-md sm:text-sm">
                  {chapterLabel}
                  {readingMode === "horizontal"
                    ? ` · ${currentPage + 1}/${chapter.pages.length}`
                    : null}
                </p>
              </div>
            </div>

            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 dark:border-gray-700/50 dark:bg-gray-800/30 dark:hover:bg-gray-700/40"
                  aria-label="Reader settings"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 space-y-4 border-gray-700 bg-gray-900 text-white"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 bg-black/40 text-white hover:bg-gray-800"
                    onClick={() => handleChapterChange("prev")}
                    disabled={!hasPrevChapter}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 bg-black/40 text-white hover:bg-gray-800"
                    onClick={() => handleChapterChange("next")}
                    disabled={!hasNextChapter}
                  >
                    Next
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Orientation</p>
                  <Select value={readingMode} onValueChange={setReadingMode}>
                    <SelectTrigger className="h-9 w-full border-gray-700 bg-black/50 text-sm text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-700 bg-gray-900">
                      <SelectItem
                        value="vertical"
                        className="text-white hover:bg-gray-800 focus:bg-gray-800"
                      >
                        Vertical
                      </SelectItem>
                      <SelectItem
                        value="horizontal"
                        className="text-white hover:bg-gray-800 focus:bg-gray-800"
                      >
                        Horizontal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Fit</p>
                  <Select value={imageFit} onValueChange={setImageFit}>
                    <SelectTrigger className="h-9 w-full border-gray-700 bg-black/50 text-sm text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-700 bg-gray-900">
                      <SelectItem
                        value="width"
                        className="text-white hover:bg-gray-800 focus:bg-gray-800"
                      >
                        Fit Width
                      </SelectItem>
                      <SelectItem
                        value="height"
                        className="text-white hover:bg-gray-800 focus:bg-gray-800"
                      >
                        Fit Height
                      </SelectItem>
                      <SelectItem
                        value="original"
                        className="text-white hover:bg-gray-800 focus:bg-gray-800"
                      >
                        Original
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Sun className="h-3.5 w-3.5" />
                      Brightness
                    </p>
                    <span className="text-xs text-gray-300">
                      {Math.round(brightness * 100)}%
                    </span>
                  </div>
                  <Slider
                    min={Math.round(BRIGHTNESS_MIN * 100)}
                    max={Math.round(BRIGHTNESS_MAX * 100)}
                    step={1}
                    value={[Math.round(brightness * 100)]}
                    onValueChange={(values) => {
                      const pct = values[0] ?? 100;
                      persistBrightness(pct / 100);
                    }}
                    className="w-full"
                  />
                </div>

                {readingMode === "horizontal" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-600 bg-black/40 text-white hover:bg-gray-800"
                    onClick={() => setCurrentPage(0)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    First page
                  </Button>
                ) : null}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "relative transition-[padding] duration-200",
          chromeVisible ? "pt-16 sm:pt-20" : "pt-0"
        )}
        onPointerDown={onReaderPointerDown}
        onPointerMove={onReaderPointerMove}
        onPointerUp={onReaderPointerUp}
        onPointerCancel={() => {
          pointerStartRef.current = null;
          pointerMovedRef.current = false;
        }}
      >
        {readingMode === "vertical" ? (
          <div className="mx-auto max-w-4xl px-4 py-8">
            {chapter.pages.map((page: string, index: number) => (
              <div
                key={index}
                id={
                  index === chapter.pages.length - 1
                    ? "reader-last-page"
                    : undefined
                }
                className="mb-4"
              >
                <ReaderScanImage
                  src={page}
                  alt={`Page ${index + 1}`}
                  eager={index === 0}
                  className={`w-full ${
                    imageFit === "width"
                      ? "h-auto"
                      : imageFit === "height"
                        ? "h-screen object-contain"
                        : "h-auto"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-screen items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              {chapter.pages.length > 0 ? (
                <ReaderScanImage
                  src={chapter.pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  eager
                  className={`max-h-full max-w-full ${
                    imageFit === "width"
                      ? "h-auto w-full"
                      : imageFit === "height"
                        ? "h-full w-auto"
                        : "max-h-full max-w-full"
                  }`}
                />
              ) : null}

              {chromeVisible ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="pointer-events-auto border-gray-700 bg-black/50 text-white hover:bg-gray-800"
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePageChange("prev");
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    disabled={currentPage === 0}
                  >
                    <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="pointer-events-auto border-gray-700 bg-black/50 text-white hover:bg-gray-800"
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePageChange("next");
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    disabled={currentPage === chapter.pages.length - 1}
                  >
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {dimOpacity > 0 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-black"
            style={{ opacity: dimOpacity }}
          />
        ) : null}
      </main>

      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-md border-gray-700 bg-gray-900 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="mb-4 text-xl font-semibold">Chapter Complete!</h3>
              <p className="mb-6 text-gray-300">
                You&apos;ve finished reading this chapter. What would you like
                to do next?
              </p>
              <div className="flex flex-col space-y-3">
                {hasNextChapter && (
                  <Button
                    onClick={() => handleChapterChange("next")}
                    className="w-full transform border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-95"
                  >
                    Read Next Chapter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {manga?.id ? (
                  <Link href={mangaPath(provider, manga.id)} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full transform border-gray-600 bg-gray-800 text-white transition-all duration-300 hover:scale-[1.02] hover:border-gray-500 hover:bg-gray-700 active:scale-95"
                    >
                      Back to Manga
                    </Button>
                  </Link>
                ) : null}
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full transform border-gray-600 bg-gray-800 text-white transition-all duration-300 hover:scale-[1.02] hover:border-gray-500 hover:bg-gray-700 active:scale-95"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
