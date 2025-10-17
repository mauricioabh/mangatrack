import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mangaBookmarkSchema } from "@/lib/validations";
import { aj } from "@/lib/arcjet";

// GET - Check if manga is bookmarked
export async function GET(request: NextRequest) {
  // Apply Arcjet protection
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { success: false, error: "Request blocked by security policy" },
      { status: 403 }
    );
  }

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

    // Check if manga is bookmarked
    const bookmark = await db.userManga.findUnique({
      where: {
        userId_mangaId: {
          userId: user.id,
          mangaId: mangaId,
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

/**
 * @swagger
 * /api/manga/bookmark:
 *   post:
 *     summary: Bookmark a manga
 *     description: Add a manga to the user's bookmarks. Basic users are limited to 10 bookmarks.
 *     tags: [Manga]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mangaId:
 *                 type: string
 *                 format: cuid
 *                 description: ID of the manga to bookmark
 *                 example: "clx1234567890abcdef"
 *             required:
 *               - mangaId
 *     responses:
 *       200:
 *         description: Manga bookmarked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserManga'
 *       400:
 *         description: Manga already bookmarked or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Bookmark limit exceeded for basic users or request blocked by security policy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Manga not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function POST(request: NextRequest) {
  // Apply Arcjet protection
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { success: false, error: "Request blocked by security policy" },
      { status: 403 }
    );
  }

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

    // Check if manga exists
    const manga = await db.manga.findUnique({
      where: {
        id: validatedData.mangaId,
      },
    });

    if (!manga) {
      return NextResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await db.userManga.findUnique({
      where: {
        userId_mangaId: {
          userId: user.id,
          mangaId: validatedData.mangaId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { success: false, error: "Manga already bookmarked" },
        { status: 400 }
      );
    }

    // Check user's bookmark limit for basic users
    if (user.tier === "BASIC") {
      const bookmarkCount = await db.userManga.count({
        where: {
          userId: user.id,
        },
      });

      if (bookmarkCount >= 10) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Basic users can only bookmark up to 10 manga. Upgrade to Premium for unlimited bookmarks.",
          },
          { status: 403 }
        );
      }
    }

    // Create bookmark
    const bookmark = await db.userManga.create({
      data: {
        userId: user.id,
        mangaId: validatedData.mangaId,
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

/**
 * @swagger
 * /api/manga/bookmark:
 *   delete:
 *     summary: Remove manga bookmark
 *     description: Remove a manga from the user's bookmarks.
 *     tags: [Manga]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mangaId:
 *                 type: string
 *                 format: cuid
 *                 description: ID of the manga to remove from bookmarks
 *                 example: "clx1234567890abcdef"
 *             required:
 *               - mangaId
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Request blocked by security policy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Bookmark not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function DELETE(request: NextRequest) {
  // Apply Arcjet protection
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { success: false, error: "Request blocked by security policy" },
      { status: 403 }
    );
  }

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

    // Check if bookmark exists
    const existingBookmark = await db.userManga.findUnique({
      where: {
        userId_mangaId: {
          userId: user.id,
          mangaId: validatedData.mangaId,
        },
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { success: false, error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Remove bookmark
    await db.userManga.delete({
      where: {
        id: existingBookmark.id,
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
