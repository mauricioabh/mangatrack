import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { STRIPE_PRICE_IDS } from "@/lib/constants";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      { error: "Failed to fetch price IDs" },
      { status: 500 }
    );
  }
}









