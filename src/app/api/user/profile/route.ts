import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userUpdateSchema } from "@/lib/validations";
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
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
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
    const validatedData = userUpdateSchema.parse(body);

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
