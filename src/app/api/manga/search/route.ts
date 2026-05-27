import { NextRequest, NextResponse } from "next/server";
import { mangaSearchSchema } from "@/lib/validations";
import { searchManga, MangaDexError } from "@/lib/mangadex";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "";
    const genre = searchParams.get("genre") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const validatedData = mangaSearchSchema.parse({
      query,
      page,
      limit,
      status: status || undefined,
      genres: genre ? [genre] : undefined,
    });

    const result = await searchManga({
      query: validatedData.query,
      page: validatedData.page,
      limit: validatedData.limit,
      status: validatedData.status,
      genre: genre || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    if (error instanceof MangaDexError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status >= 500 ? 502 : error.status }
      );
    }
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search manga" },
      { status: 500 }
    );
  }
}
