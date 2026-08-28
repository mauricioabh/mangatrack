import { env } from "@/env";
import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import type { JwtPayload } from "@clerk/types";
import { headers } from "next/headers";

/**
 * Resolves Clerk user id from session cookies (web) or Bearer session token (Android).
 */
export async function getClerkUserId(): Promise<string | null> {
  const session = await auth();
  if (session.userId) {
    return session.userId;
  }

  const headerStore = await headers();
  const authorization = headerStore.get("authorization");
  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();
  if (!token || !env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const result = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    if (result.errors || !result.data) {
      return null;
    }
    const payload = result.data as JwtPayload;
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
