import { getChapterPageUrls } from "./at-home-pages";
import { getContentRatings, mangadexFetch } from "./client";
import {
  collectChapterRefsFromFeed,
  mapChapterCollectionFeed,
  mapFeedToChapters,
  getMangaIdFromChapterRelationships,
  mapMangaCollection,
  mapMangaDetail,
} from "./mappers";
import { buildIncludedMap } from "./mappers";
import { resolveGenreTagId } from "./tags";
import { isMangaDexFeedChapterCollection } from "./types";
import type {
  ChapterListItem,
  MangaDexChapterAttributes,
  MangaDexCollectionResponse,
  MangaDexEntity,
  MangaDexFeedChapterCollectionResponse,
  MangaDexFeedResponse,
  MangaDexMangaAttributes,
  MangaDexSingleResponse,
  MangaDetail,
  MangaListItem,
} from "./types";

const MANGA_INCLUDES = ["cover_art", "author", "artist", "tag"] as const;

function mangaListParams(
  options: {
    title?: string;
    limit?: number;
    offset?: number;
    status?: string;
    includedTagId?: string;
  } = {}
): Record<string, string | string[] | number | undefined> {
  const ratings = getContentRatings();
  const params: Record<string, string | string[] | number | undefined> = {
    limit: options.limit ?? 20,
    offset: options.offset ?? 0,
    "includes[]": [...MANGA_INCLUDES],
    "availableTranslatedLanguage[]": ["en", "es"],
    "contentRating[]": ratings,
    "order[latestUploadedChapter]": "desc",
  };

  if (options.title?.trim()) {
    params.title = options.title.trim();
  }
  if (options.status) {
    params["status[]"] = options.status.toLowerCase();
  }
  if (options.includedTagId) {
    params["includedTags[]"] = options.includedTagId;
  }

  return params;
}

export async function searchManga(options: {
  query?: string;
  page?: number;
  limit?: number;
  status?: string;
  genre?: string;
}): Promise<{ data: MangaListItem[]; total: number; page: number; limit: number }> {
  const limit = options.limit ?? 20;
  const page = options.page ?? 1;
  const offset = (page - 1) * limit;

  let includedTagId: string | undefined;
  if (options.genre) {
    includedTagId = (await resolveGenreTagId(options.genre)) ?? undefined;
    if (!includedTagId) {
      return { data: [], total: 0, page, limit };
    }
  }

  const res = await mangadexFetch<
    MangaDexCollectionResponse<MangaDexEntity<MangaDexMangaAttributes>>
  >("/manga", mangaListParams({
    title: options.query,
    limit,
    offset,
    status: options.status,
    includedTagId,
  }));

  return {
    data: mapMangaCollection(res),
    total: res.total,
    page,
    limit,
  };
}

export async function getMangaByIds(ids: string[]): Promise<MangaListItem[]> {
  if (ids.length === 0) return [];

  const res = await mangadexFetch<
    MangaDexCollectionResponse<MangaDexEntity<MangaDexMangaAttributes>>
  >("/manga", {
    ...mangaListParams({ limit: Math.min(ids.length, 100), offset: 0 }),
    "ids[]": ids,
  });

  return mapMangaCollection(res);
}

export async function getMangaDetail(mangaId: string): Promise<MangaDetail | null> {
  const res = await mangadexFetch<
    MangaDexSingleResponse<MangaDexEntity<MangaDexMangaAttributes>>
  >(`/manga/${mangaId}`, {
    "includes[]": [...MANGA_INCLUDES],
  });

  if (!res.data) return null;

  const chapters = await getMangaChapters(mangaId);
  const included = buildIncludedMap(res.included);
  return mapMangaDetail(res.data, included, chapters);
}

export async function getMangaChapters(mangaId: string): Promise<ChapterListItem[]> {
  const preferLang = ["en", "es"];
  const feedParams = {
    "translatedLanguage[]": preferLang,
    "order[chapter]": "desc",
    limit: 100,
    offset: 0,
  };

  const feed = await mangadexFetch<MangaDexFeedResponse>(
    `/manga/${mangaId}/feed`,
    feedParams
  );

  if (isMangaDexFeedChapterCollection(feed)) {
    const allChapters = [...feed.data];
    const total = feed.total ?? allChapters.length;
    let offset = allChapters.length;

    while (offset < total) {
      const page = await mangadexFetch<MangaDexFeedChapterCollectionResponse>(
        `/manga/${mangaId}/feed`,
        { ...feedParams, offset }
      );
      if (page.data.length === 0) break;
      allChapters.push(...page.data);
      offset += page.data.length;
    }

    return mapChapterCollectionFeed({ ...feed, data: allChapters }, mangaId);
  }

  const refs = collectChapterRefsFromFeed(feed);
  if (refs.length === 0) return [];

  const chapterMap = new Map<string, MangaDexEntity<MangaDexChapterAttributes>>();

  const batchSize = 100;
  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = refs.slice(i, i + batchSize);
    const ids = batch.map((r) => r.id);
    const res = await mangadexFetch<
      MangaDexCollectionResponse<MangaDexEntity<MangaDexChapterAttributes>>
    >("/chapter", {
      "ids[]": ids,
      "includes[]": ["manga"],
    });
    for (const ch of res.data) {
      chapterMap.set(ch.id, ch);
    }
  }

  return mapFeedToChapters(feed, chapterMap, mangaId);
}

export async function getChapterReaderPayload(chapterDexId: string): Promise<{
  chapter: {
    id: string;
    title: string;
    chapterNumber: number;
    pages: string[];
  };
  manga: MangaListItem;
  chapters: ChapterListItem[];
} | null> {
  const chapterRes = await mangadexFetch<
    MangaDexSingleResponse<MangaDexEntity<MangaDexChapterAttributes>>
  >(`/chapter/${chapterDexId}`);

  const chapterEntity = chapterRes.data;
  if (!chapterEntity) return null;

  const mangaId = getMangaIdFromChapterRelationships(
    chapterEntity.relationships
  );
  if (!mangaId) return null;

  const [mangaDetail, pages] = await Promise.all([
    getMangaDetail(mangaId),
    getChapterPageUrls(chapterDexId),
  ]);

  if (!mangaDetail || pages.length === 0) return null;
  const attrs = chapterEntity.attributes;
  const chapterNumber = attrs.chapter
    ? parseFloat(attrs.chapter)
    : 0;

  const currentChapter = mangaDetail.chapters.find((c) => c.id === chapterDexId);

  return {
    chapter: {
      id: chapterDexId,
      title:
        currentChapter?.title ??
        attrs.title ??
        `Chapter ${attrs.chapter ?? chapterNumber}`,
      chapterNumber: currentChapter?.chapterNumber ?? chapterNumber,
      pages,
    },
    manga: mangaDetail,
    chapters: mangaDetail.chapters,
  };
}
