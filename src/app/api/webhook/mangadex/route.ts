import { NextResponse } from "next/server";

/**
 * MangaDex chapter webhook — disabled after Consumet cutover.
 * New chapters are detected by the daily Inngest poll (`poll-favorite-chapters-daily`).
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "MangaDex webhook disabled. Chapter notifications use daily Consumet polling.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return POST();
}
