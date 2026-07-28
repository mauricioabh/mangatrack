import {
  consumetFetch,
  getProviderAllowlist,
  getSoftPreferredProvider,
} from "./client";
import { ConsumetError } from "./errors";
import {
  buildChapterPageProxyPaths,
  mapMangaDetail,
  mapPages,
  mapSearchResult,
} from "./mappers";
import {
  consumetInfoPath,
  consumetReadPath,
  usesPathStyleInfo,
  usesPathStyleRead,
} from "./provider-routes";
import {
  applySearchRelevance,
  parseSearchQuery,
  resolveMatchMode,
  resolveSearchProviders,
  type SearchMatchMode,
} from "./search-relevance";
import type {
  ConsumetInfoResponse,
  ConsumetReadResponse,
  ConsumetSearchResponse,
  MangaDetail,
  MangaSummary,
  Page,
} from "./types";

export async function searchManga(
  provider: string,
  query: string,
  page = 1
): Promise<{ data: MangaSummary[]; hasNextPage: boolean; page: number }> {
  const q = query.trim();
  if (!q) {
    return { data: [], hasNextPage: false, page };
  }

  const encoded = encodeURIComponent(q);
  const res = await consumetFetch<ConsumetSearchResponse>(
    `/manga/${provider}/${encoded}`,
    {
      params: page > 1 ? { page } : undefined,
      revalidate: 300,
    }
  );

  const results = res.results ?? [];
  return {
    data: results.map((r) => mapSearchResult(r, provider)),
    hasNextPage: Boolean(res.hasNextPage),
    page: res.currentPage ?? page,
  };
}

export interface MultiSearchProviderResult {
  provider: string;
  data: MangaSummary[];
  error?: string;
}

export interface MultiSearchOptions {
  page?: number;
  /** Subset of allowlist; empty/undefined = all allowlisted providers */
  providers?: string[];
  /** ranked (default) or exact phrase filter */
  match?: SearchMatchMode;
}

export async function searchMangaMultiProvider(
  query: string,
  pageOrOptions: number | MultiSearchOptions = 1
): Promise<{
  data: MangaSummary[];
  providers: MultiSearchProviderResult[];
  availableProviders: string[];
  match: SearchMatchMode;
  total: number;
  page: number;
  /** True if any successful provider reported a next page */
  hasMore: boolean;
}> {
  const options: MultiSearchOptions =
    typeof pageOrOptions === "number"
      ? { page: pageOrOptions }
      : pageOrOptions;
  const page = options.page ?? 1;
  const allowlist = getProviderAllowlist();
  const availableProviders = allowlist;
  const providers = resolveSearchProviders(allowlist, options.providers);
  const preferred = getSoftPreferredProvider();

  const { query: parsedQuery, quotedExact } = parseSearchQuery(query);
  const match = resolveMatchMode(options.match, quotedExact);

  if (providers.length === 0) {
    return {
      data: [],
      providers: [],
      availableProviders,
      match,
      total: 0,
      page,
      hasMore: false,
    };
  }

  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const result = await searchManga(provider, parsedQuery, page);
      return { provider, ...result } as MultiSearchProviderResult & {
        hasNextPage: boolean;
      };
    })
  );

  const providerResults: MultiSearchProviderResult[] = [];
  let all: MangaSummary[] = [];
  let hasMore = false;

  for (let i = 0; i < settled.length; i++) {
    const provider = providers[i];
    const outcome = settled[i];
    if (outcome.status === "fulfilled") {
      providerResults.push({
        provider,
        data: outcome.value.data,
      });
      all.push(...outcome.value.data);
      if (outcome.value.hasNextPage) {
        hasMore = true;
      }
    } else {
      const message =
        outcome.reason instanceof Error
          ? outcome.reason.message
          : "Provider unavailable";
      providerResults.push({ provider, data: [], error: message });
    }
  }

  // Soft provider preference as tie-breaker after relevance
  if (preferred) {
    all.sort((a, b) => {
      if (a.provider === preferred && b.provider !== preferred) return -1;
      if (b.provider === preferred && a.provider !== preferred) return 1;
      return a.provider.localeCompare(b.provider);
    });
  } else {
    all.sort((a, b) => a.provider.localeCompare(b.provider));
  }

  all = applySearchRelevance(all, parsedQuery, match);

  return {
    data: all,
    providers: providerResults,
    availableProviders,
    match,
    total: all.length,
    page,
    hasMore,
  };
}

export async function getMangaInfo(
  provider: string,
  id: string,
  fallbackTitle?: string
): Promise<MangaDetail | null> {
  const providerKey = provider.toLowerCase();
  try {
    const path = consumetInfoPath(providerKey, id);
    const info = await consumetFetch<ConsumetInfoResponse>(path, {
      params: usesPathStyleInfo(providerKey) ? undefined : { id },
      revalidate: 300,
    });
    // MangaDex query-style mis-route returns a search payload (results, no id)
    if (!info?.id) return null;
    return mapMangaDetail(info, providerKey, fallbackTitle);
  } catch (error) {
    if (error instanceof ConsumetError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Short TTL so chapter JSON + page proxies share one Consumet scrape per instance. */
const PAGE_LIST_TTL_MS = 5 * 60 * 1000;

const pageListCache = new Map<
  string,
  { pages: Page[]; expires: number }
>();
const pageListInflight = new Map<string, Promise<Page[]>>();

function pageListCacheKey(provider: string, chapterId: string): string {
  return `${provider.toLowerCase()}::${chapterId}`;
}

async function fetchChapterPagesUncached(
  providerKey: string,
  chapterId: string
): Promise<Page[]> {
  const path = consumetReadPath(providerKey, chapterId);
  const raw = await consumetFetch<ConsumetReadResponse>(path, {
    params: usesPathStyleRead(providerKey) ? undefined : { chapterId },
    cache: "no-store",
  });

  if (!Array.isArray(raw)) {
    throw new ConsumetError(
      "Invalid chapter pages response (provider may not host this chapter)",
      502,
      true
    );
  }

  return mapPages(raw);
}

export async function getChapterPages(
  provider: string,
  chapterId: string
): Promise<Page[]> {
  const providerKey = provider.toLowerCase();
  const key = pageListCacheKey(providerKey, chapterId);

  const cached = pageListCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.pages;
  }

  const inflight = pageListInflight.get(key);
  if (inflight) return inflight;

  const promise = fetchChapterPagesUncached(providerKey, chapterId)
    .then((pages) => {
      pageListCache.set(key, {
        pages,
        expires: Date.now() + PAGE_LIST_TTL_MS,
      });
      return pages;
    })
    .finally(() => {
      pageListInflight.delete(key);
    });

  pageListInflight.set(key, promise);
  return promise;
}

/**
 * Infer manga id when the reader opens without `?mangaId=`.
 * MangaPill chapters look like `3069-10700500/naruto-chapter-700.5`
 * while the manga id is `3069/naruto` (not the prefix before `/`).
 */
export function inferMangaIdFromChapterId(
  provider: string,
  chapterId: string
): string | undefined {
  const p = provider.toLowerCase();
  if (p === "mangapill") {
    const match = chapterId.match(/^(\d+)-\d+\/(.+)-chapter-/i);
    if (match) return `${match[1]}/${match[2]}`;
  }
  const slash = chapterId.indexOf("/");
  if (slash > 0) return chapterId.slice(0, slash);
  return undefined;
}

export async function getChapterReaderPayload(
  provider: string,
  chapterId: string,
  mangaId?: string
): Promise<{
  chapter: {
    id: string;
    title: string;
    chapterNumber: number;
    pages: string[];
    pageReferers: (string | undefined)[];
  };
  manga: MangaSummary;
  chapters: MangaDetail["chapters"];
} | null> {
  const resolvedMangaId =
    mangaId?.trim() || inferMangaIdFromChapterId(provider, chapterId);

  if (!resolvedMangaId) {
    throw new ConsumetError(
      "mangaId is required when chapter id has no manga prefix",
      400,
      false
    );
  }

  const [detail, pages] = await Promise.all([
    getMangaInfo(provider, resolvedMangaId),
    getChapterPages(provider, chapterId),
  ]);

  if (!detail || pages.length === 0) return null;

  const listed = detail.chapters.find((c) => c.id === chapterId);

  return {
    chapter: {
      id: chapterId,
      title: listed?.title ?? `Chapter ${listed?.chapterNumber ?? ""}`.trim(),
      chapterNumber: listed?.chapterNumber ?? 0,
      pages: pages.map((p) => p.url),
      pageReferers: pages.map((p) => p.referer),
    },
    manga: detail,
    chapters: detail.chapters,
  };
}

export { buildChapterPageProxyPaths };
