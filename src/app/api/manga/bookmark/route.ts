import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mangaBookmarkSchema } from "@/lib/validations";

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

    if (!mangaId) {
      return NextResponse.json(
        { success: false, error: "Manga ID is required" },
        { status: 400 }
      );
    }

    const bookmark = await db.userFavorite.findUnique({
      where: {
        userId_mangaDexId: {
          userId: user.id,
          mangaDexId: mangaId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isBookmarked: !!bookmark,
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
    const mangaDexId = validatedData.mangaId;

    const existingBookmark = await db.userFavorite.findUnique({
      where: {
        userId_mangaDexId: {
          userId: user.id,
          mangaDexId,
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
        mangaDexId,
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

    await db.userFavorite.delete({
      where: {
        userId_mangaDexId: {
          userId: user.id,
          mangaDexId: validatedData.mangaId,
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
