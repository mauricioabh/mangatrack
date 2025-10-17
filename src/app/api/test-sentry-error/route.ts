import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { aj } from "@/lib/arcjet";

/**
 * @swagger
 * /api/test-sentry-error:
 *   post:
 *     summary: Test Sentry error reporting
 *     description: Trigger test errors to verify Sentry integration
 *     tags: [Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [server, api]
 *                 description: Type of error to trigger
 *     responses:
 *       200:
 *         description: Error triggered successfully
 *       500:
 *         description: Test error (expected)
 */
export async function POST(request: NextRequest) {
  // Apply Arcjet protection
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { success: false, error: "Request blocked by security policy" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "server":
        // Trigger a server-side error
        throw new Error("🧪 Test server-side error for Sentry!");

      case "api":
        // Trigger an API error with more context
        Sentry.addBreadcrumb({
          message: "User triggered API test error",
          level: "info",
        });

        Sentry.setContext("test_error", {
          type: "api_test",
          timestamp: new Date().toISOString(),
          user_agent: request.headers.get("user-agent"),
        });

        throw new Error("🔌 Test API error for Sentry with context!");

      default:
        return NextResponse.json(
          { success: false, error: "Invalid error type" },
          { status: 400 }
        );
    }
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error);

    console.error("Sentry test error triggered:", error);

    return NextResponse.json(
      {
        success: true,
        message: "Test error sent to Sentry successfully!",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
