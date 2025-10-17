import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { aj } from "@/lib/arcjet";

interface MangaRouteProps {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: MangaRouteProps) {
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

    // Await params before using
    const { slug } = await params;
    console.log("Fetching manga with slug:", slug);

    // Get manga by slug with chapters
    const manga = await db.manga.findUnique({
      where: {
        slug: slug,
      },
      include: {
        chapters: {
          orderBy: {
            chapterNumber: "asc",
          },
        },
      },
    });

    if (!manga) {
      console.log("Manga not found for slug:", slug);
      return NextResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    console.log("Manga found:", manga.title);

    // Transform the data to return page count instead of full pages array
    const transformedManga = {
      ...manga,
      chapters: manga.chapters.map((chapter) => ({
        ...chapter,
        pages: chapter.pages.length, // Return count instead of array
        pagesData: chapter.pages, // Keep original data for reader
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedManga,
    });
  } catch (error) {
    console.error("Error fetching manga:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch manga" },
      { status: 500 }
    );
  }
}
