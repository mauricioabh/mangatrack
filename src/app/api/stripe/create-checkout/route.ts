import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/constants";
import { createCheckoutSession } from "@/lib/stripe";
import { stripeCheckoutSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
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
    const { priceId, successUrl, cancelUrl } = stripeCheckoutSchema.parse(body);

    const appUrl = APP_CONFIG.APP_URL;
    const session = await createCheckoutSession(
      user.id,
      priceId,
      successUrl ?? `${appUrl}/dashboard?success=true`,
      cancelUrl ?? `${appUrl}/settings?canceled=true`
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
