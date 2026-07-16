import { getMangaInfo } from "@/lib/consumet";

export interface ChapterPushContent {
  title: string;
  body: string;
  provider: string;
  externalMangaId: string;
  externalChapterId: string;
}

export async function buildChapterPushContent(options: {
  provider: string;
  externalMangaId: string;
  externalChapterId: string;
  chapterTitle?: string;
  chapterNumber?: number;
}): Promise<ChapterPushContent | null> {
  const {
    provider,
    externalMangaId,
    externalChapterId,
    chapterTitle,
    chapterNumber,
  } = options;

  if (!externalChapterId) return null;

  let mangaTitle = "Your manga";
  try {
    const detail = await getMangaInfo(provider, externalMangaId);
    if (detail?.title) mangaTitle = detail.title;
  } catch {
    // keep fallback title
  }

  const label =
    chapterTitle?.trim() ||
    (chapterNumber != null ? `Ch. ${chapterNumber}` : "New chapter");

  return {
    title: "New chapter available",
    body: `${mangaTitle} — ${label}`,
    provider,
    externalMangaId,
    externalChapterId,
  };
}
