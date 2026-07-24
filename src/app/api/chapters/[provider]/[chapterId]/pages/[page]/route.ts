import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  ConsumetError,
  decodeExternalId,
  getChapterPages,
} from "@/lib/consumet";
import { getProviderReferer } from "@/lib/consumet/referers";

interface PageRouteProps {
  params: Promise<{
    provider: string;
    chapterId: string;
    page: string;
  }>;
}

export async function GET(request: NextRequest, { params }: PageRouteProps) {
  const { provider, chapterId: rawChapterId, page } = await params;
  const chapterId = decodeExternalId(rawChapterId);
  const providerKey = provider.toLowerCase();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pageIndex = Number.parseInt(page, 10);
    if (!Number.isFinite(pageIndex) || pageIndex < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid page index" },
        { status: 400 }
      );
    }

    const pages = await getChapterPages(providerKey, chapterId);
    const pageEntry =
      pages.find((p) => p.index === pageIndex) ?? pages[pageIndex];
    if (!pageEntry?.url) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    const referer =
      pageEntry.referer ||
      getProviderReferer(providerKey) ||
      request.headers.get("referer") ||
      undefined;

    const imageRes = await fetch(pageEntry.url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(referer ? { Referer: referer } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to load page image" },
        { status: imageRes.status === 404 ? 404 : 502 }
      );
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const body = await imageRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    if (error instanceof ConsumetError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status === 404 ? 404 : 502 }
      );
    }
    console.error("Error proxying chapter page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load page" },
      { status: 500 }
    );
  }
}
