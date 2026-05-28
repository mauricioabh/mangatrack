import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { getClerkUserId } from "./auth-request";

/**
 * Get the current authenticated user from the database
 *
 * This function retrieves the authenticated user from Clerk and then fetches
 * the corresponding user record from the database. Returns null if no user
 * is authenticated or if the user doesn't exist in the database.
 *
 * @returns Promise<User | null> The authenticated user or null if not found
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log(`Welcome, ${user.name}!`);
 * } else {
 *   console.log('No user authenticated');
 * }
 * ```
 */
export async function getCurrentUser() {
  const userId = await getClerkUserId();
  if (!userId) return null;

  const existing = await db.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  // Clerk session exists but Neon row missing (webhook missed or user pre-dates webhook).
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    undefined;

  return getOrCreateUser(userId, email, name, clerkUser.imageUrl);
}

/**
 * Get or create user from Clerk authentication
 *
 * This function checks if a user exists in the database based on their Clerk ID.
 * If the user exists, it returns the existing user. If not, it creates a new
 * user record with the provided information.
 *
 * @param clerkId - The Clerk user ID
 * @param email - The user's email address
 * @param name - The user's display name (optional)
 * @param avatar - The user's avatar URL (optional)
 * @returns Promise<User> The existing or newly created user
 *
 * @example
 * ```typescript
 * const user = await getOrCreateUser(
 *   'user_123',
 *   'user@example.com',
 *   'John Doe',
 *   'https://example.com/avatar.jpg'
 * );
 * ```
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  name?: string,
  avatar?: string
) {
  console.log("getOrCreateUser called with:", { clerkId, email, name, avatar });

  const existingUser = await db.user.findUnique({
    where: {
      clerkId,
    },
  });

  if (existingUser) {
    console.log("Found existing user:", existingUser);
    return existingUser;
  }

  console.log("Creating new user with data:", { clerkId, email, name, avatar });
  const newUser = await db.user.create({
    data: {
      clerkId,
      email,
      name,
      avatar,
    },
  });

  console.log("Created new user:", newUser);
  return newUser;
}
