import { NextRequest, NextResponse } from "next/server";
import { mangaSearchSchema } from "@/lib/validations";
import {
  ConsumetConfigError,
  ConsumetError,
  searchMangaMultiProvider,
} from "@/lib/consumet";

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

    if (!validatedData.query?.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        providers: [],
        pagination: {
          page: validatedData.page,
          limit: validatedData.limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const result = await searchMangaMultiProvider(
      validatedData.query,
      validatedData.page
    );

    let data = result.data;
    if (validatedData.status) {
      data = data.filter((m) => m.status === validatedData.status);
    }
    if (genre) {
      const g = genre.toLowerCase();
      data = data.filter((m) =>
        m.genres.some((x) => x.toLowerCase() === g)
      );
    }

    // Soft client-side page slice if providers return large pages
    const start = 0;
    const sliced = data.slice(start, start + validatedData.limit);

    return NextResponse.json({
      success: true,
      data: sliced,
      providers: result.providers.map((p) => ({
        provider: p.provider,
        count: p.data.length,
        error: p.error,
      })),
      pagination: {
        page: result.page,
        limit: validatedData.limit,
        total: data.length,
        pages: Math.max(1, Math.ceil(data.length / validatedData.limit)),
      },
    });
  } catch (error) {
    if (error instanceof ConsumetConfigError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    if (error instanceof ConsumetError) {
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
