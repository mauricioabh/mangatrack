import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma client instance for database operations
 * 
 * This module exports a singleton Prisma client instance that is reused
 * across the application. In development, the client is stored in the global
 * object to prevent multiple instances during hot reloads.
 * 
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma database client instance
 * 
 * This is the main database client used throughout the application for
 * all database operations. It's configured to use the DATABASE_URL
 * environment variable for connection.
 * 
 * @example
 * ```typescript
 * import { db } from '@/lib/db';
 * 
 * const users = await db.user.findMany();
 * const manga = await db.manga.create({
 *   data: { userId: '...', mangaDexId: '<mangadex-uuid>' }
 * });
 * ```
 */
export const db = globalForPrisma.prisma ?? new PrismaClient();

// Store the client in global object in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
