import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferencesSchema } from "@/lib/validations";
import { aj } from "@/lib/arcjet";

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      preferences: {
        emailNotifications: user.emailNotifications,
      },
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = userPreferencesSchema.parse(body);

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailNotifications: validatedData.emailNotifications,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
      },
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
