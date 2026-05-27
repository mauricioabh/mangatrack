import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import {
  extractChapterPayload,
  extractMangaId,
  extractTranslatedLanguage,
  isAllowedChapterLanguage,
  parseMangadexWebhookPayload,
} from "@/lib/mangadex/webhook";

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.MANGADEX_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }
  const header =
    request.headers.get("x-mangadex-signature") ??
    request.headers.get("x-webhook-secret");
  return header === secret;
}

export async function POST(request: NextRequest) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true, ignored: "invalid_json" });
  }

  const parsed = parseMangadexWebhookPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: true, ignored: parsed.error });
  }

  if (parsed.event !== "chapter.created") {
    return NextResponse.json({ ok: true, ignored: "event_type" });
  }

  const chapter = extractChapterPayload(parsed.data);
  if (!chapter) {
    return NextResponse.json({ ok: true, ignored: "missing_chapter" });
  }

  const translatedLanguage = extractTranslatedLanguage(parsed.data, chapter);
  if (!isAllowedChapterLanguage(translatedLanguage)) {
    return NextResponse.json({ ok: true, ignored: "language" });
  }

  const manga_id = extractMangaId(parsed.data, chapter);
  if (!manga_id) {
    return NextResponse.json({ ok: true, ignored: "missing_manga_id" });
  }

  await inngest.send({
    name: "manga/chapter.published",
    data: {
      manga_id,
      chapter,
      translatedLanguage: translatedLanguage!,
    },
  });

  return NextResponse.json({ ok: true });
}
