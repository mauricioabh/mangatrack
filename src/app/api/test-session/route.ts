import { env } from "@/env";
import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { db } from "@/lib/db";

export async function GET() {
  console.log("🚀 API route called - test-session");
  console.log("🔍 NODE_ENV:", env.NODE_ENV);

  // Only allow in test and development environments
  const isTestEnv =
    env.NODE_ENV === "test" ||
    env.NODE_ENV === "development" ||
    env.PLAYWRIGHT_TEST === true;

  if (!isTestEnv) {
    console.log("❌ Forbidden - not in test/development mode");
    console.log(`   NODE_ENV: ${env.NODE_ENV}`);
    console.log(`   PLAYWRIGHT_TEST: ${env.PLAYWRIGHT_TEST}`);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    console.log("🚀 Starting session creation...");

    // Find the test user by email in our database
    const testUserEmail = env.TEST_USER_EMAIL;

    if (!testUserEmail) {
      return NextResponse.json(
        { error: "TEST_USER_EMAIL environment variable is required" },
        { status: 500 },
      );
    }

    console.log("🔍 Looking for test user:", testUserEmail);

    const testUser = await db.user.findUnique({
      where: { email: testUserEmail },
    });

    if (!testUser) {
      console.log("❌ Test user not found");
      return NextResponse.json(
        {
          error: `Test user with email ${testUserEmail} not found in database`,
        },
        { status: 404 },
      );
    }

    console.log("✅ Test user found:", testUser.clerkId);

    // Create a Clerk client instance using the correct backend SDK
    console.log("🔧 Creating Clerk client...");
    const clerkClient = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
    });

    // Create a session using Clerk's backend SDK
    console.log("🎫 Creating session...");
    const session = await clerkClient.sessions.createSession({
      userId: testUser.clerkId,
    });

    console.log("🔍 Session object:", JSON.stringify(session, null, 2));

    return NextResponse.json({
      sessionToken: session.id, // Use the session ID as the token
    });
  } catch (error) {
    console.error("❌ Failed to create test session:", error);
    return NextResponse.json(
      {
        error: "Failed to create test session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
