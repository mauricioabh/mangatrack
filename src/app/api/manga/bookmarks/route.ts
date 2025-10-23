import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
/**
 * @swagger
 * /api/manga/bookmarks:
 *   get:
 *     summary: Get user's bookmarked manga
 *     description: Retrieve a paginated list of manga bookmarked by the authenticated user.
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successful retrieval of bookmarked manga
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginationResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/UserManga'
 *                           - type: object
 *                             properties:
 *                               manga:
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/Manga'
 *                                   - type: object
 *                                     properties:
 *                                       chapters:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             id:
 *                                               type: string
 *                                               format: cuid
 *                                             chapterNumber:
 *                                               type: number
 *                                               format: float
 *                                         description: Latest chapter information
 *                                       _count:
 *                                         type: object
 *                                         properties:
 *                                           chapters:
 *                                             type: integer
 *                                         description: Total chapter count
 *       400:
 *         description: Invalid pagination parameters
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function GET(request: NextRequest) {
try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Get user's bookmarked manga with pagination
    const [bookmarks, total] = await Promise.all([
      db.userManga.findMany({
        where: {
          userId: user.id,
        },
        include: {
          manga: {
            include: {
              chapters: {
                orderBy: {
                  chapterNumber: "desc",
                },
                take: 1,
              },
              _count: {
                select: {
                  chapters: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.userManga.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookmarks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
