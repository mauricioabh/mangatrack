import { z } from "zod";

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

export const mangaSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  genres: z.array(z.string()).optional(),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]).optional(),
});

const providerSchema = z
  .string()
  .min(1, "Provider is required")
  .max(64)
  .regex(/^[a-z0-9_-]+$/i, "Invalid provider");

const externalIdSchema = z.string().min(1, "External id is required").max(512);

export const mangaBookmarkSchema = z.object({
  provider: providerSchema,
  mangaId: externalIdSchema,
});

export const pushTokenPlatformSchema = z.enum(["WEB", "ANDROID"]);

export const pushTokenSchema = z.object({
  token: z.string().min(1, "FCM token is required").max(4096),
  platform: pushTokenPlatformSchema.optional().default("WEB"),
});

export const stripeCheckoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  successUrl: z.string().min(1).optional(),
  cancelUrl: z.string().min(1).optional(),
});

export const chapterReadSchema = z.object({
  provider: providerSchema,
  chapterId: externalIdSchema,
  mangaId: externalIdSchema,
});

export const notificationUpdateSchema = z.object({
  notificationId: z.string().cuid("Invalid notification ID"),
  read: z.boolean(),
});

export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type MangaSearchInput = z.infer<typeof mangaSearchSchema>;
export type MangaBookmarkInput = z.infer<typeof mangaBookmarkSchema>;
export type ChapterReadInput = z.infer<typeof chapterReadSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;
