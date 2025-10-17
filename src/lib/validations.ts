import { z } from "zod";

/**
 * Validation schemas for MangaTrack API
 *
 * This module contains Zod validation schemas for all API endpoints,
 * ensuring type safety and data validation throughout the application.
 *
 * @see https://zod.dev/
 */

// User validation schemas

/**
 * Schema for updating user profile information
 *
 * @example
 * ```typescript
 * const userData = userUpdateSchema.parse({
 *   name: "John Doe",
 *   avatar: "https://example.com/avatar.jpg"
 * });
 * ```
 */
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  emailNotifications: z.boolean().optional(),
});

export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
});

// Manga validation schemas
export const mangaSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  genres: z.array(z.string()).optional(),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]).optional(),
});

export const mangaBookmarkSchema = z.object({
  mangaId: z.string().cuid("Invalid manga ID"),
});

// Chapter validation schemas
export const chapterReadSchema = z.object({
  chapterId: z.string().cuid("Invalid chapter ID"),
  mangaId: z.string().cuid("Invalid manga ID"),
});

// Notification validation schemas
export const notificationUpdateSchema = z.object({
  notificationId: z.string().cuid("Invalid notification ID"),
  read: z.boolean(),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type MangaSearchInput = z.infer<typeof mangaSearchSchema>;
export type MangaBookmarkInput = z.infer<typeof mangaBookmarkSchema>;
export type ChapterReadInput = z.infer<typeof chapterReadSchema>;
export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
