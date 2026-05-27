import { buildCoverUrl } from "./covers";
import { getPreferredLanguages, pickLocalized } from "./locale";
import type {
  AppMangaStatus,
  ChapterListItem,
  MangaDexAtHomeResponse,
  MangaDexChapterAttributes,
  MangaDexCollectionResponse,
  MangaDexCoverAttributes,
  MangaDexEntity,
  MangaDexFeedAggregateResponse,
  MangaDexFeedChapterCollectionResponse,
  MangaDexInlineRelationship,
  MangaDexMangaAttributes,
  MangaDexRelationshipRef,
  MangaDexRelationships,
  MangaDexTagAttributes,
  MangaDexAuthorAttributes,
  MangaDetail,
  MangaListItem,
} from "./types";

function isInlineRelationships(
  relationships: MangaDexRelationships | undefined
): relationships is MangaDexInlineRelationship[] {
  return Array.isArray(relationships);
}

/** Resolve parent manga id from chapter detail (inline or legacy relationships). */
export function getMangaIdFromChapterRelationships(
  relationships: MangaDexRelationships | undefined
): string | null {
  if (!relationships) return null;

  if (isInlineRelationships(relationships)) {
    const manga = relationships.find((r) => r.type === "manga");
    return manga?.id ?? null;
  }

  const mangaRef = relationships.manga?.data;
  if (!mangaRef || Array.isArray(mangaRef)) return null;
  return mangaRef.id;
}

function mapStatus(status: string): AppMangaStatus {
  const upper = status.toUpperCase();
  if (
    upper === "ONGOING" ||
    upper === "COMPLETED" ||
    upper === "HIATUS" ||
    upper === "CANCELLED"
  ) {
    return upper as AppMangaStatus;
  }
  return "ONGOING";
}

export function buildIncludedMap(
  included?: MangaDexEntity<unknown>[]
): Map<string, MangaDexEntity<unknown>> {
  const map = new Map<string, MangaDexEntity<unknown>>();
  if (!included) return map;
  for (const item of included) {
    map.set(`${item.type}:${item.id}`, item);
  }
  return map;
}

function getCoverFileName(
  relationships: MangaDexRelationships | undefined,
  included: Map<string, MangaDexEntity<unknown>>
): string | undefined {
  if (isInlineRelationships(relationships)) {
    const cover = relationships.find((r) => r.type === "cover_art");
    const fileName = (cover?.attributes as MangaDexCoverAttributes | undefined)
      ?.fileName;
    if (fileName) return fileName;
    return undefined;
  }

  if (!relationships || Array.isArray(relationships)) return undefined;
  const coverRef = relationships.cover_art?.data;
  if (!coverRef || Array.isArray(coverRef)) return undefined;
  const cover = included.get(`cover_art:${coverRef.id}`) as
    | MangaDexEntity<MangaDexCoverAttributes>
    | undefined;
  return cover?.attributes?.fileName;
}

function getGenreNames(
  relationships: MangaDexRelationships | undefined,
  included: Map<string, MangaDexEntity<unknown>>
): string[] {
  const prefer = getPreferredLanguages();
  const genres: string[] = [];

  if (isInlineRelationships(relationships)) {
    for (const rel of relationships) {
      if (rel.type !== "tag") continue;
      const attrs = rel.attributes as MangaDexTagAttributes | undefined;
      if (attrs?.group === "genre") {
        const name = pickLocalized(attrs.name, prefer);
        if (name) genres.push(name);
      }
    }
    return genres;
  }

  if (!relationships || Array.isArray(relationships)) return [];
  const tagRefs = relationships.tags?.data;
  if (!tagRefs || !Array.isArray(tagRefs)) return [];

  for (const ref of tagRefs) {
    const tag = included.get(`tag:${ref.id}`) as
      | MangaDexEntity<MangaDexTagAttributes>
      | undefined;
    if (tag?.attributes?.group === "genre") {
      const name = pickLocalized(tag.attributes.name, prefer);
      if (name) genres.push(name);
    }
  }
  return genres;
}

function getAuthorNames(
  relationships: MangaDexRelationships | undefined,
  included: Map<string, MangaDexEntity<unknown>>
): string | undefined {
  const names: string[] = [];

  if (isInlineRelationships(relationships)) {
    for (const rel of relationships) {
      if (rel.type !== "author" && rel.type !== "artist") continue;
      const attrs = rel.attributes as MangaDexAuthorAttributes | undefined;
      if (attrs?.name) names.push(attrs.name);
    }
    return names.length > 0 ? names.join(", ") : undefined;
  }

  if (!relationships || Array.isArray(relationships)) return undefined;

  const authorRefs = relationships.author?.data;
  if (Array.isArray(authorRefs)) {
    for (const ref of authorRefs) {
      const author = included.get(`author:${ref.id}`) as
        | MangaDexEntity<MangaDexAuthorAttributes>
        | undefined;
      if (author?.attributes?.name) names.push(author.attributes.name);
    }
  }

  const artistRefs = relationships.artist?.data;
  if (Array.isArray(artistRefs) && names.length === 0) {
    for (const ref of artistRefs) {
      const artist = included.get(`author:${ref.id}`) as
        | MangaDexEntity<MangaDexAuthorAttributes>
        | undefined;
      if (artist?.attributes?.name) names.push(artist.attributes.name);
    }
  }

  return names.length > 0 ? names.join(", ") : undefined;
}

export function mapMangaEntityToListItem(
  entity: MangaDexEntity<MangaDexMangaAttributes>,
  included: Map<string, MangaDexEntity<unknown>>
): MangaListItem {
  const prefer = getPreferredLanguages();
  const fileName = getCoverFileName(entity.relationships, included);

  return {
    id: entity.id,
    title: pickLocalized(entity.attributes.title, prefer),
    description:
      pickLocalized(entity.attributes.description, prefer) || undefined,
    coverImage: fileName
      ? buildCoverUrl(entity.id, fileName, 512)
      : undefined,
    status: mapStatus(entity.attributes.status),
    genres: getGenreNames(entity.relationships, included),
    author: getAuthorNames(entity.relationships, included),
  };
}

export function mapMangaCollection(
  response: MangaDexCollectionResponse<MangaDexEntity<MangaDexMangaAttributes>>
): MangaListItem[] {
  const included = buildIncludedMap(response.included);
  return response.data.map((m) => mapMangaEntityToListItem(m, included));
}

export function mapMangaDetail(
  entity: MangaDexEntity<MangaDexMangaAttributes>,
  included: Map<string, MangaDexEntity<unknown>>,
  chapters: ChapterListItem[]
): MangaDetail {
  const base = mapMangaEntityToListItem(entity, included);
  return { ...base, chapters };
}

function parseChapterNumber(chapter: string | null, volume: string | null): number {
  const c = chapter ? parseFloat(chapter) : NaN;
  if (!Number.isNaN(c)) return c;
  const v = volume ? parseFloat(volume) : NaN;
  if (!Number.isNaN(v)) return v;
  return 0;
}

export function mapChapterCollectionFeed(
  feed: MangaDexFeedChapterCollectionResponse,
  mangaId: string
): ChapterListItem[] {
  const items: ChapterListItem[] = [];

  for (const ch of feed.data) {
    if (ch.type !== "chapter") continue;
    const attrs = ch.attributes;
    const num = parseChapterNumber(attrs.chapter, attrs.volume);
    const title =
      attrs.title?.trim() ||
      (attrs.chapter ? `Chapter ${attrs.chapter}` : `Chapter ${num}`);

    items.push({
      id: ch.id,
      mangaId,
      title,
      chapterNumber: num,
      pages: attrs.pages ?? 0,
      publishedAt: attrs.readableAt ?? attrs.publishAt,
    });
  }

  return sortChaptersNewestFirst(items);
}

export function mapFeedToChapters(
  feed: MangaDexFeedAggregateResponse,
  chapterEntities: Map<string, MangaDexEntity<MangaDexChapterAttributes>>,
  mangaId: string
): ChapterListItem[] {
  const items: ChapterListItem[] = [];

  for (const volume of feed.volumes) {
    const chapterRefs = volume.relationships?.chapters?.data ?? [];
    for (const ref of chapterRefs) {
      const ch = chapterEntities.get(ref.id);
      if (!ch) continue;
      const attrs = ch.attributes;
      const num = parseChapterNumber(attrs.chapter, attrs.volume);
      const title =
        attrs.title?.trim() ||
        (attrs.chapter ? `Chapter ${attrs.chapter}` : `Chapter ${num}`);

      items.push({
        id: ch.id,
        mangaId,
        title,
        chapterNumber: num,
        pages: attrs.pages ?? 0,
        publishedAt: attrs.readableAt ?? attrs.publishAt,
      });
    }
  }

  return sortChaptersNewestFirst(items);
}

/** Newest chapter first (for detail lists). */
export function sortChaptersNewestFirst(
  chapters: ChapterListItem[]
): ChapterListItem[] {
  return [...chapters].sort((a, b) => {
    if (b.chapterNumber !== a.chapterNumber) {
      return b.chapterNumber - a.chapterNumber;
    }
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });
}

/** Lowest chapter number (start reading from the beginning). */
export function getFirstChapterToRead<T extends { chapterNumber: number }>(
  chapters: T[]
): T | undefined {
  if (chapters.length === 0) return undefined;
  return [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber)[0];
}

/**
 * Neighbors for reader navigation when `chapters` is newest-first
 * (same order as manga detail). Next = higher chapter number; previous = lower.
 */
export function getChapterNeighbors<T extends { id: string }>(
  chapters: T[],
  currentChapterId: string
): {
  next: T | null;
  previous: T | null;
  currentIndex: number;
} {
  const currentIndex = chapters.findIndex((c) => c.id === currentChapterId);
  if (currentIndex === -1) {
    return { next: null, previous: null, currentIndex: -1 };
  }
  return {
    next: currentIndex > 0 ? chapters[currentIndex - 1]! : null,
    previous:
      currentIndex < chapters.length - 1
        ? chapters[currentIndex + 1]!
        : null,
    currentIndex,
  };
}

export function mapAtHomeToPages(
  atHome: MangaDexAtHomeResponse,
  dataSaver = false
): string[] {
  const { baseUrl, chapter } = atHome;
  const quality = dataSaver ? "data-saver" : "data";
  const files = dataSaver ? chapter.dataSaver : chapter.data;
  return files.map((file) => `${baseUrl}/${quality}/${chapter.hash}/${file}`);
}

export function collectChapterRefsFromFeed(
  feed: MangaDexFeedAggregateResponse
): MangaDexRelationshipRef[] {
  const refs: MangaDexRelationshipRef[] = [];
  for (const volume of feed.volumes ?? []) {
    const chapters = volume.relationships?.chapters?.data ?? [];
    refs.push(...chapters);
  }
  return refs;
}
