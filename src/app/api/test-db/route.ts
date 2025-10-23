import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("🧪 Testing database connection...");

    // Test database connection
    const userCount = await db.user.count();

    console.log("✅ Database connection successful!");
    console.log("📊 Current user count:", userCount);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
