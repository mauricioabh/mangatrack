import { z } from "zod";

const ALLOWED_LANGUAGES = new Set(["es", "es-la", "en"]);

const mangadexWebhookSchema = z
  .object({
    event: z.string(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export function parseMangadexWebhookPayload(
  body: unknown
):
  | { ok: true; event: string; data: Record<string, unknown> }
  | { ok: false; error: string } {
  const parsed = mangadexWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Invalid webhook payload" };
  }

  const data =
    parsed.data.data && typeof parsed.data.data === "object"
      ? (parsed.data.data as Record<string, unknown>)
      : {};

  return { ok: true, event: parsed.data.event, data };
}

export function isAllowedChapterLanguage(language: string | undefined): boolean {
  if (!language) {
    return false;
  }
  return ALLOWED_LANGUAGES.has(language.toLowerCase());
}

export function extractTranslatedLanguage(
  data: Record<string, unknown>,
  chapter: Record<string, unknown>
): string | undefined {
  if (typeof data.translatedLanguage === "string") {
    return data.translatedLanguage;
  }

  const attrs =
    chapter.attributes && typeof chapter.attributes === "object"
      ? (chapter.attributes as Record<string, unknown>)
      : null;

  const fromChapter = attrs?.translatedLanguage;
  if (typeof fromChapter === "string") {
    return fromChapter;
  }
  if (Array.isArray(fromChapter) && typeof fromChapter[0] === "string") {
    return fromChapter[0];
  }

  return undefined;
}

export function extractMangaId(
  data: Record<string, unknown>,
  chapter: Record<string, unknown>
): string | undefined {
  if (typeof data.manga_id === "string") {
    return data.manga_id;
  }
  if (typeof data.mangaId === "string") {
    return data.mangaId;
  }

  const relationships = chapter.relationships;
  if (!relationships || typeof relationships !== "object") {
    return undefined;
  }

  const mangaRel = (relationships as Record<string, unknown>).manga;
  if (!mangaRel || typeof mangaRel !== "object") {
    return undefined;
  }

  const relData = (mangaRel as Record<string, unknown>).data;
  if (Array.isArray(relData) && relData[0] && typeof relData[0] === "object") {
    const id = (relData[0] as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }

  if (relData && typeof relData === "object" && "id" in relData) {
    const id = (relData as { id: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }

  return undefined;
}

export function extractChapterPayload(
  data: Record<string, unknown>
): Record<string, unknown> | undefined {
  const chapter = data.chapter;
  if (chapter && typeof chapter === "object") {
    return chapter as Record<string, unknown>;
  }
  return undefined;
}
