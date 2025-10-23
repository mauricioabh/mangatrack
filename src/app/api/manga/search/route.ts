import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mangaSearchSchema } from "@/lib/validations";
/**
 * @swagger
 * /api/manga/search:
 *   get:
 *     summary: Search manga with filters
 *     description: Search for manga by title, author, description, status, or genre. This endpoint is public and does not require authentication.
 *     tags: [Manga]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for manga title, author, or description
 *         example: "One Piece"
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ONGOING, COMPLETED, HIATUS, CANCELLED]
 *         description: Filter by manga status
 *         example: "ONGOING"
 *       - in: query
 *         name: genre
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by manga genre
 *         example: "Action"
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
 *           maximum: 50
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Successful search results
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
 *                           - $ref: '#/components/schemas/Manga'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   chapters:
 *                                     type: integer
 *                                     description: Number of chapters
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "";
    const genre = searchParams.get("genre") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate input
    const validatedData = mangaSearchSchema.parse({
      query,
      page,
      limit,
      status: status || undefined,
      genres: genre ? [genre] : undefined,
    });

    // Build search conditions
    const where: Record<string, unknown> = {};

    if (validatedData.query && validatedData.query.trim()) {
      where.OR = [
        {
          title: {
            contains: validatedData.query,
            mode: "insensitive",
          },
        },
        {
          author: {
            contains: validatedData.query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: validatedData.query,
            mode: "insensitive",
          },
        },
      ];
    }

    if (validatedData.status) {
      where.status = validatedData.status;
    }

    if (validatedData.genres && validatedData.genres.length > 0) {
      where.genres = {
        hasSome: validatedData.genres,
      };
    }

    // Execute search
    const [mangas, total] = await Promise.all([
      db.manga.findMany({
        where,
        skip: (validatedData.page - 1) * validatedData.limit,
        take: validatedData.limit,
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          status: true,
          genres: true,
          author: true,
          artist: true,
          _count: {
            select: {
              chapters: true,
            },
          },
        },
      }),
      db.manga.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: mangas,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total,
        pages: Math.ceil(total / validatedData.limit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search manga",
      },
      { status: 500 }
    );
  }
}
