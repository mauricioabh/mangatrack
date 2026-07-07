import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  allowSearchIndexing,
  getSiteUrl,
} from "@/lib/seo/site";

export type PageMetadataInput = {
  title: string;
  description?: string;
  pathname: string;
  noIndex?: boolean;
};

const DEFAULT_TITLE = `${SITE_NAME} - Discover, Read & Track Manga`;

function resolveTitle(title: string): string {
  return title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonicalPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pageUrl = new URL(canonicalPath, getSiteUrl()).href;
  const resolvedTitle = resolveTitle(title);
  const indexingBlocked = noIndex || !allowSearchIndexing();

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical: canonicalPath },
    robots: indexingBlocked
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
  };
}

export function rootLayoutMetadata(): Metadata {
  const indexingBlocked = !allowSearchIndexing();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: ["manga", "anime", "reading", "tracking", "otaku"],
    authors: [{ name: "MangaTrack Team" }],
    alternates: { canonical: "/" },
    robots: indexingBlocked
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      type: "website",
      locale: "en_US",
      url: getSiteUrl(),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
  };
}
