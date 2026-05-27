import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushTokenSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token, platform } = pushTokenSchema.parse(body);

    const record = await db.userPushToken.upsert({
      where: {
        userId_token: {
          userId: user.id,
          token,
        },
      },
      create: {
        userId: user.id,
        token,
        platform,
      },
      update: {
        platform,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: record.id },
    });
  } catch (error) {
    console.error("Error registering push token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register push token" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = pushTokenSchema.parse(body);

    await db.userPushToken.deleteMany({
      where: {
        userId: user.id,
        token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing push token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove push token" },
      { status: 500 }
    );
  }
}
