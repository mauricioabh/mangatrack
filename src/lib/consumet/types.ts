/** App-facing domain types (BFF contract) */

export type AppMangaStatus = "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED";

export interface MangaSummary {
  id: string;
  provider: string;
  title: string;
  description?: string;
  coverImage?: string;
  /** Referer required by scrape CDN for covers (proxied via BFF) */
  coverReferer?: string;
  status: AppMangaStatus;
  genres: string[];
  author?: string;
}

/** @deprecated Prefer MangaSummary — kept as alias for gradual UI migration */
export type MangaListItem = MangaSummary;

export interface Chapter {
  id: string;
  mangaId: string;
  title: string;
  chapterNumber: number;
  pages: number;
  publishedAt?: string;
}

/** @deprecated Prefer Chapter */
export type ChapterListItem = Chapter;

export interface MangaDetail extends MangaSummary {
  artist?: string;
  chapters: Chapter[];
}

export interface Page {
  index: number;
  url: string;
  referer?: string;
}

/** Raw Consumet wire shapes (loose) */

export interface ConsumetSearchResult {
  id: string;
  title?: string | null;
  altTitles?: string[];
  image?: string | null;
  description?: string | null;
  status?: string | null;
  headerForImage?: Record<string, string>;
}

export interface ConsumetSearchResponse {
  currentPage?: number;
  hasNextPage?: boolean;
  results?: ConsumetSearchResult[];
}

export interface ConsumetChapterRaw {
  id: string;
  title?: string | null;
  chapterNumber?: string | number | null;
  volumeNumber?: string | number | null;
  releasedDate?: string | null;
}

export interface ConsumetInfoResponse {
  id: string;
  title?: string | null;
  altTitles?: string[] | Array<Record<string, string>>;
  description?: string | null;
  image?: string | null;
  status?: string | null;
  genres?: string[];
  authors?: string[];
  artist?: string | string[];
  chapters?: ConsumetChapterRaw[];
  headers?: Record<string, string>;
}

export interface ConsumetPageRaw {
  page?: number;
  img?: string;
  headerForImage?: Record<string, string>;
}

export type ConsumetReadResponse = ConsumetPageRaw[];
