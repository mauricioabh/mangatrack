/** MangaDex JSON:API minimal types */

export type LocalizedString = Record<string, string>;

export type MangaDexEntityType =
  | "manga"
  | "chapter"
  | "cover_art"
  | "tag"
  | "author"
  | "artist";

export interface MangaDexRelationshipRef {
  id: string;
  type: string;
}

/** MangaDex list/detail responses embed related resources inline (array). */
export interface MangaDexInlineRelationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export type MangaDexRelationships =
  | MangaDexInlineRelationship[]
  | Record<
      string,
      { data: MangaDexRelationshipRef | MangaDexRelationshipRef[] | null }
    >;

export interface MangaDexEntity<TAttributes> {
  id: string;
  type: string;
  attributes: TAttributes;
  relationships?: MangaDexRelationships;
}

export interface MangaDexMangaAttributes {
  title: LocalizedString;
  altTitles?: { en?: string }[];
  description: LocalizedString;
  status: "ongoing" | "completed" | "hiatus" | "cancelled";
  year?: number;
  contentRating: string;
  tags?: MangaDexRelationshipRef[];
}

export interface MangaDexCoverAttributes {
  fileName: string;
  locale?: string;
  description?: string;
}

export interface MangaDexTagAttributes {
  name: LocalizedString;
  group: "genre" | "theme" | "format" | "content";
}

export interface MangaDexAuthorAttributes {
  name: string;
}

export interface MangaDexChapterAttributes {
  title: string | null;
  volume: string | null;
  chapter: string | null;
  pages: number;
  translatedLanguage: string[];
  publishAt?: string;
  readableAt?: string;
}

export interface MangaDexCollectionResponse<T> {
  result: string;
  response: string;
  data: T[];
  limit: number;
  offset: number;
  total: number;
  included?: MangaDexEntity<unknown>[];
}

export interface MangaDexSingleResponse<T> {
  result: string;
  response: string;
  data: T;
  included?: MangaDexEntity<unknown>[];
}

export interface MangaDexAtHomeResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface MangaDexFeedVolume {
  id: string;
  type: string;
  attributes: {
    volume: string | null;
    count: number;
  };
  relationships?: {
    chapters?: { data: MangaDexRelationshipRef[] };
  };
}

/** Legacy aggregate feed (volumes → chapter refs). */
export interface MangaDexFeedAggregateResponse {
  result: string;
  volumes: MangaDexFeedVolume[];
}

/** Current feed: flat chapter collection with inline attributes. */
export interface MangaDexFeedChapterCollectionResponse {
  result: string;
  response: string;
  data: MangaDexEntity<MangaDexChapterAttributes>[];
  limit?: number;
  offset?: number;
  total?: number;
}

export type MangaDexFeedResponse =
  | MangaDexFeedAggregateResponse
  | MangaDexFeedChapterCollectionResponse;

export function isMangaDexFeedChapterCollection(
  feed: MangaDexFeedResponse
): feed is MangaDexFeedChapterCollectionResponse {
  return Array.isArray((feed as MangaDexFeedChapterCollectionResponse).data);
}

/** App-facing types (BFF contract) */

export type AppMangaStatus = "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED";

export interface MangaListItem {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  status: AppMangaStatus;
  genres: string[];
  author?: string;
}

export interface ChapterListItem {
  id: string;
  mangaId: string;
  title: string;
  chapterNumber: number;
  pages: number;
  publishedAt?: string;
}

export interface MangaDetail extends MangaListItem {
  artist?: string;
  chapters: ChapterListItem[];
}
