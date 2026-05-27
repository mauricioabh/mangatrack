import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { STRIPE_PRICE_IDS } from "@/lib/constants";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      priceIds: {
        monthly: STRIPE_PRICE_IDS.MONTHLY,
        yearly: STRIPE_PRICE_IDS.YEARLY,
      },
    });
  } catch (error) {
    console.error("Error fetching price IDs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch price IDs" },
      { status: 500 }
    );
  }
}









