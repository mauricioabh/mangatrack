import { getMangaDetail } from "@/lib/mangadex";

export interface ChapterPushContent {
  title: string;
  body: string;
  mangaDexId: string;
  chapterDexId: string;
}

function getChapterId(chapter: Record<string, unknown>): string | undefined {
  if (typeof chapter.id === "string") {
    return chapter.id;
  }
  const data = chapter.data;
  if (
    data &&
    typeof data === "object" &&
    "id" in data &&
    typeof (data as { id: unknown }).id === "string"
  ) {
    return (data as { id: string }).id;
  }
  return undefined;
}

function getChapterLabel(chapter: Record<string, unknown>): string {
  const attrs =
    chapter.attributes && typeof chapter.attributes === "object"
      ? (chapter.attributes as Record<string, unknown>)
      : null;

  if (attrs) {
    const volume = attrs.volume;
    const number = attrs.chapter;
    const title = attrs.title;
    const parts: string[] = [];
    if (volume != null && String(volume).length > 0) {
      parts.push(`Vol. ${volume}`);
    }
    if (number != null && String(number).length > 0) {
      parts.push(`Ch. ${number}`);
    }
    if (typeof title === "string" && title.trim().length > 0) {
      parts.push(title.trim());
    }
    if (parts.length > 0) {
      return parts.join(" · ");
    }
  }

  return "New chapter";
}

export async function buildChapterPushContent(
  mangaDexId: string,
  chapter: Record<string, unknown>,
  translatedLanguage: string
): Promise<ChapterPushContent | null> {
  const chapterDexId = getChapterId(chapter);
  if (!chapterDexId) {
    return null;
  }

  const detail = await getMangaDetail(mangaDexId);
  const mangaTitle = detail?.title ?? "Your manga";
  const chapterLabel = getChapterLabel(chapter);

  return {
    title: "New chapter available",
    body: `${mangaTitle} — ${chapterLabel} (${translatedLanguage})`,
    mangaDexId,
    chapterDexId,
  };
}
