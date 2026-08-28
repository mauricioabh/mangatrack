"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogCoverProps {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Consumet provider id — used to pick default Referer for the cover proxy */
  provider?: string;
  /** Explicit Referer from Consumet `headerForImage` */
  referer?: string | null;
  /**
   * Manga title — enables AniList cover fallback when a CDN is
   * Cloudflare-blocked (passed to /api/catalog/cover?title=).
   */
  title?: string | null;
}

function proxyCoverUrl(
  src: string,
  provider?: string,
  referer?: string | null,
  title?: string | null,
  attempt = 0,
): string {
  const params = new URLSearchParams({ url: src });
  if (provider) params.set("provider", provider);
  if (referer) params.set("referer", referer);
  if (title?.trim()) params.set("title", title.trim());
  if (attempt > 0) params.set("_r", String(attempt));
  return `/api/catalog/cover?${params.toString()}`;
}

/**
 * Cover images from Consumet scrape CDNs require hotlink Referers.
 * Load via BFF proxy (optional AniList title fallback); retry once on failure.
 */
export function CatalogCover({
  src,
  alt,
  width,
  height,
  className,
  provider,
  referer,
  title,
}: CatalogCoverProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src, provider, referer, title]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        style={{ minWidth: width, minHeight: height }}
        aria-label={alt}
        role="img"
      >
        <BookOpen className="h-1/3 w-1/3 max-h-10 max-w-10 opacity-50" />
      </div>
    );
  }

  const imgSrc = proxyCoverUrl(src, provider, referer, title ?? alt, attempt);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${imgSrc}:${attempt}`}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(className)}
      loading="lazy"
      onError={() => {
        if (attempt < 1) {
          window.setTimeout(
            () => setAttempt((a) => a + 1),
            400 + Math.random() * 600,
          );
          return;
        }
        setFailed(true);
      }}
    />
  );
}
