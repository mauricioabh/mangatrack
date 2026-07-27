import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mangaBookmarkSchema, mangaFinishedSchema } from "@/lib/validations";

const BASIC_BOOKMARK_LIMIT = 50;

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

    if (!mangaId || !provider) {
      return NextResponse.json(
        { success: false, error: "provider and mangaId are required" },
        { status: 400 }
      );
    }

    const bookmark = await db.userFavorite.findUnique({
      where: {
        userId_provider_externalMangaId: {
          userId: user.id,
          provider,
          externalMangaId: mangaId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isBookmarked: !!bookmark,
      isFinished: Boolean(bookmark?.finishedAt),
    });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check bookmark status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = mangaBookmarkSchema.parse(body);
    const provider = validatedData.provider.toLowerCase();
    const externalMangaId = validatedData.mangaId;

    const existingBookmark = await db.userFavorite.findUnique({
      where: {
        userId_provider_externalMangaId: {
          userId: user.id,
          provider,
          externalMangaId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { success: false, error: "Manga already bookmarked" },
        { status: 400 }
      );
    }

    if (user.tier === "BASIC") {
      const bookmarkCount = await db.userFavorite.count({
        where: { userId: user.id },
      });

      if (bookmarkCount >= BASIC_BOOKMARK_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            error: `Basic users can only bookmark up to ${BASIC_BOOKMARK_LIMIT} manga. Upgrade to Premium for unlimited bookmarks.`,
          },
          { status: 403 }
        );
      }
    }

    const bookmark = await db.userFavorite.create({
      data: {
        userId: user.id,
        provider,
        externalMangaId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Manga bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    console.error("Error bookmarking manga:", error);
    return NextResponse.json(
      { success: false, error: "Failed to bookmark manga" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = mangaBookmarkSchema.parse(body);
    const provider = validatedData.provider.toLowerCase();

    await db.userFavorite.delete({
      where: {
        userId_provider_externalMangaId: {
          userId: user.id,
          provider,
          externalMangaId: validatedData.mangaId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = mangaFinishedSchema.parse(body);
    const provider = validatedData.provider.toLowerCase();

    const bookmark = await db.userFavorite.findUnique({
      where: {
        userId_provider_externalMangaId: {
          userId: user.id,
          provider,
          externalMangaId: validatedData.mangaId,
        },
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { success: false, error: "Manga is not in your library" },
        { status: 404 }
      );
    }

    const updated = await db.userFavorite.update({
      where: { id: bookmark.id },
      data: {
        finishedAt: validatedData.finished ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: validatedData.finished
        ? "Marked as finished"
        : "Removed finished status",
      data: {
        isFinished: Boolean(updated.finishedAt),
        finishedAt: updated.finishedAt,
      },
    });
  } catch (error) {
    console.error("Error updating finished status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update finished status" },
      { status: 500 }
    );
  }
}
