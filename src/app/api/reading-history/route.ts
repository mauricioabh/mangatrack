import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { chapterReadSchema } from "@/lib/validations";
import { getMangaInfo } from "@/lib/consumet";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = chapterReadSchema.parse(body);
    const provider = validatedData.provider.toLowerCase();

    const existingHistory = await db.readingHistory.findUnique({
      where: {
        userId_provider_externalChapterId: {
          userId: user.id,
          provider,
          externalChapterId: validatedData.chapterId,
        },
      },
    });

    if (existingHistory) {
      await db.readingHistory.update({
        where: { id: existingHistory.id },
        data: { readAt: new Date() },
      });
    } else {
      await db.readingHistory.create({
        data: {
          userId: user.id,
          provider,
          externalMangaId: validatedData.mangaId,
          externalChapterId: validatedData.chapterId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Chapter marked as read",
    });
  } catch (error) {
    console.error("Error marking chapter as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark chapter as read" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get("mangaId");
    const provider = searchParams.get("provider")?.toLowerCase();

    const where: {
      userId: string;
      externalMangaId?: string;
      provider?: string;
    } = {
      userId: user.id,
    };

    if (mangaId) {
      where.externalMangaId = mangaId;
    }
    if (provider) {
      where.provider = provider;
    }

    const history = await db.readingHistory.findMany({
      where,
      orderBy: { readAt: "desc" },
    });

    if (!mangaId || !provider || history.length === 0) {
      return NextResponse.json({
        success: true,
        data: history,
      });
    }

    try {
      const detail = await getMangaInfo(provider, mangaId);
      const chapterNumById = new Map(
        (detail?.chapters ?? []).map((c) => [c.id, c.chapterNumber])
      );

      const data = history.map((h) => ({
        ...h,
        chapterNumber: chapterNumById.get(h.externalChapterId) ?? null,
      }));

      return NextResponse.json({
        success: true,
        data,
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: history,
      });
    }
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reading history" },
      { status: 500 }
    );
  }
}
