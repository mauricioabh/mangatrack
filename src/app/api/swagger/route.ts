import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { swaggerSpec } from "@/lib/swagger";

/**
 * API endpoint to serve Swagger specification
 * This runs on the server side where Node.js modules like 'fs' are available
 * Protected by Clerk authentication
 */
export async function GET() {
  try {
    // Check if user is authenticated
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(swaggerSpec);
  } catch (error) {
    console.error("Error generating Swagger spec:", error);
    return NextResponse.json(
      { error: "Failed to generate Swagger specification" },
      { status: 500 }
    );
  }
}
