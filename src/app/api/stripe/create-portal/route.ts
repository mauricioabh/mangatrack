import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { ajStrict } from "@/lib/arcjet";

export async function POST(request: NextRequest) {
  // Apply strict Arcjet protection for payment endpoints
  const decision = await ajStrict.protect(request);

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

    // In a real implementation, you would store the Stripe customer ID
    // when the user first subscribes. For now, we'll return an error.
    return NextResponse.json(
      { success: false, error: "Customer portal not yet implemented" },
      { status: 501 }
    );

    // Example implementation (uncomment when you have customer IDs):
    /*
    const session = await createPortalSession(
      user.stripeCustomerId, // You'll need to add this field to your User model
      `${process.env.NEXT_PUBLIC_APP_URL}/settings`
    );

    return NextResponse.json({
      success: true,
      url: session.url,
    });
    */
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
