import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchBrowseFeed } from "@/lib/browse";
import { browseFeedSchema } from "@/lib/validations";

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
    const parsed = browseFeedSchema.safeParse({
      mode: searchParams.get("mode") ?? undefined,
      period: searchParams.get("period") ?? undefined,
      limit: searchParams.get("limit")
        ? Number.parseInt(searchParams.get("limit")!, 10)
        : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid browse parameters",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { mode, period, limit } = parsed.data;
    const items = await fetchBrowseFeed({ mode, period, limit });

    return NextResponse.json({
      success: true,
      data: {
        mode,
        period,
        items,
      },
    });
  } catch (error) {
    console.error("Browse feed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load browse feed" },
      { status: 502 }
    );
  }
}
