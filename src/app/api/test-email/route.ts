import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendTestEmail } from "@/lib/email";
import { aj } from "@/lib/arcjet";

/**
 * @swagger
 * /api/test-email:
 *   post:
 *     summary: Send a test email
 *     description: Send a test email to verify the email service is working
 *     tags: [Email]
 *     security:
 *       - ClerkAuth: []
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    // Send test email
    const result = await sendTestEmail(user.email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
