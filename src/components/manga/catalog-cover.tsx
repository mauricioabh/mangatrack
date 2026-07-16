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
}

function proxyCoverUrl(
  src: string,
  provider?: string,
  referer?: string | null,
  attempt = 0
): string {
  const params = new URLSearchParams({ url: src });
  if (provider) params.set("provider", provider);
  if (referer) params.set("referer", referer);
  if (attempt > 0) params.set("_r", String(attempt));
  return `/api/catalog/cover?${params.toString()}`;
}

/**
 * Cover images from Consumet scrape CDNs require hotlink Referers.
 * Load via BFF proxy; retry once on failure before showing a placeholder.
 */
export function CatalogCover({
  src,
  alt,
  width,
  height,
  className,
  provider,
  referer,
}: CatalogCoverProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src, provider, referer]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ minWidth: width, minHeight: height }}
        aria-label={alt}
        role="img"
      >
        <BookOpen className="h-1/3 w-1/3 max-h-10 max-w-10 opacity-50" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${src}:${attempt}`}
      src={proxyCoverUrl(src, provider, referer, attempt)}
      alt={alt}
      width={width}
      height={height}
      className={cn(className)}
      loading="lazy"
      onError={() => {
        if (attempt < 1) {
          // Retry once after stampede / cold-compile 502s
          window.setTimeout(() => setAttempt((a) => a + 1), 400 + Math.random() * 600);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
