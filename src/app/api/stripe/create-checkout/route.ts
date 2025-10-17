import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
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

    if (user.tier === "PREMIUM") {
      return NextResponse.json(
        { success: false, error: "User already has premium subscription" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: "Price ID is required" },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(
      user.id,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`
    );

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
