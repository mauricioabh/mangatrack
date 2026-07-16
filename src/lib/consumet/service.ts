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

export async function searchMangaMultiProvider(
  query: string,
  page = 1
): Promise<{
  data: MangaSummary[];
  providers: MultiSearchProviderResult[];
  total: number;
  page: number;
}> {
  const providers = getProviderAllowlist();
  const preferred = getSoftPreferredProvider();

  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const result = await searchManga(provider, query, page);
      return { provider, ...result } as MultiSearchProviderResult & {
        hasNextPage: boolean;
      };
    })
  );

  const providerResults: MultiSearchProviderResult[] = [];
  const all: MangaSummary[] = [];

  for (let i = 0; i < settled.length; i++) {
    const provider = providers[i];
    const outcome = settled[i];
    if (outcome.status === "fulfilled") {
      providerResults.push({
        provider,
        data: outcome.value.data,
      });
      all.push(...outcome.value.data);
    } else {
      const message =
        outcome.reason instanceof Error
          ? outcome.reason.message
          : "Provider unavailable";
      providerResults.push({ provider, data: [], error: message });
    }
  }

  if (preferred) {
    all.sort((a, b) => {
      if (a.provider === preferred && b.provider !== preferred) return -1;
      if (b.provider === preferred && a.provider !== preferred) return 1;
      return a.provider.localeCompare(b.provider);
    });
  } else {
    all.sort((a, b) => a.provider.localeCompare(b.provider));
  }

  return {
    data: all,
    providers: providerResults,
    total: all.length,
    page,
  };
}

export async function getMangaInfo(
  provider: string,
  id: string,
  fallbackTitle?: string
): Promise<MangaDetail | null> {
  try {
    const info = await consumetFetch<ConsumetInfoResponse>(
      `/manga/${provider}/info`,
      {
        params: { id },
        revalidate: 300,
      }
    );
    if (!info?.id) return null;
    return mapMangaDetail(info, provider, fallbackTitle);
  } catch (error) {
    if (error instanceof ConsumetError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getChapterPages(
  provider: string,
  chapterId: string
): Promise<Page[]> {
  const raw = await consumetFetch<ConsumetReadResponse>(
    `/manga/${provider}/read`,
    {
      params: { chapterId },
      cache: "no-store",
    }
  );

  if (!Array.isArray(raw)) {
    throw new ConsumetError("Invalid chapter pages response", 502, true);
  }

  return mapPages(raw);
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
  let resolvedMangaId = mangaId;

  if (!resolvedMangaId) {
    // Best-effort: many providers nest manga slug as first path segment
    const slash = chapterId.indexOf("/");
    if (slash > 0) resolvedMangaId = chapterId.slice(0, slash);
  }

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
