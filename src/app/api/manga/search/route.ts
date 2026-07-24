import { NextRequest, NextResponse } from "next/server";
import { mangaSearchSchema } from "@/lib/validations";
import {
  ConsumetConfigError,
  ConsumetError,
  getProviderAllowlist,
  searchMangaMultiProvider,
} from "@/lib/consumet";

function parseProvidersParam(raw: string | null): string[] | undefined {
  if (!raw?.trim()) return undefined;
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "";
    const genre = searchParams.get("genre") || "";
    const match = searchParams.get("match") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const providers = parseProvidersParam(searchParams.get("providers"));

    const validatedData = mangaSearchSchema.parse({
      query,
      page,
      limit,
      status: status || undefined,
      genres: genre ? [genre] : undefined,
      match: match || undefined,
      providers,
    });

    const availableProviders = getProviderAllowlist();

    if (!validatedData.query?.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        providers: [],
        availableProviders,
        match: validatedData.match ?? "ranked",
        pagination: {
          page: validatedData.page,
          limit: validatedData.limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const result = await searchMangaMultiProvider(validatedData.query, {
      page: validatedData.page,
      providers: validatedData.providers,
      match: validatedData.match,
    });

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
      availableProviders: result.availableProviders,
      match: result.match,
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
