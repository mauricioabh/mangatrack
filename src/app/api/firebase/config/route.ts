import { NextResponse } from "next/server";
import { getFirebaseWebConfig } from "@/lib/firebase/config";

export async function GET() {
  const config = getFirebaseWebConfig();

  if (!config) {
    return NextResponse.json(
      { success: false, error: "Firebase web config not configured" },
      { status: 503 }
    );
  }

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
