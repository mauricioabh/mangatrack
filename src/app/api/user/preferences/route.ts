import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferencesSchema } from "@/lib/validations";

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
      preferences: {
        emailNotifications: user.emailNotifications,
        libraryFilterNew: user.libraryFilterNew,
        libraryFilterFinished: user.libraryFilterFinished,
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
        ...(validatedData.emailNotifications !== undefined
          ? { emailNotifications: validatedData.emailNotifications }
          : {}),
        ...(validatedData.libraryFilterNew !== undefined
          ? { libraryFilterNew: validatedData.libraryFilterNew }
          : {}),
        ...(validatedData.libraryFilterFinished !== undefined
          ? { libraryFilterFinished: validatedData.libraryFilterFinished }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
        libraryFilterNew: updatedUser.libraryFilterNew,
        libraryFilterFinished: updatedUser.libraryFilterFinished,
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
