import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  console.log("🔔 Webhook received!");
  console.log("🔍 Environment check:", {
    hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  });

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET not found in environment");
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log("📋 Event type:", eventType);

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error("❌ user.created without email:", id);
      return new Response("Missing email on user.created", { status: 422 });
    }

    console.log("👤 Creating user:", {
      id,
      email,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
    });

    const name = `${first_name || ""} ${last_name || ""}`.trim() || null;

    try {
      const user = await db.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email, name, avatar: image_url },
        update: { email, name, avatar: image_url },
      });
      console.log("✅ User upserted:", user.id);
    } catch (error) {
      console.error("❌ Error upserting user:", error);
      return new Response("Failed to create user in database", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new Response("Missing email on user.updated", { status: 422 });
    }

    const name = `${first_name || ""} ${last_name || ""}`.trim() || null;

    try {
      await db.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email, name, avatar: image_url },
        update: { email, name, avatar: image_url },
      });
    } catch (error) {
      console.error("Error upserting user on update:", error);
      return new Response("Failed to update user in database", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await db.user.delete({
        where: {
          clerkId: id,
        },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  return new Response("", { status: 200 });
}
