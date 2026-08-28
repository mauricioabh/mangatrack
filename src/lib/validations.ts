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

export const librarySortSchema = z.enum([
  "updated_desc",
  "updated_asc",
  "title_asc",
  "title_desc",
]);

export type LibrarySort = z.infer<typeof librarySortSchema>;

export const userPreferencesSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    libraryFilterNew: z.boolean().optional(),
    libraryFilterReading: z.boolean().optional(),
    libraryFilterFinished: z.boolean().optional(),
    librarySort: librarySortSchema.optional(),
  })
  .refine(
    (data) =>
      data.emailNotifications !== undefined ||
      data.libraryFilterNew !== undefined ||
      data.libraryFilterReading !== undefined ||
      data.libraryFilterFinished !== undefined ||
      data.librarySort !== undefined,
    { message: "At least one preference field is required" },
  );

const providerSchema = z
  .string()
  .min(1, "Provider is required")
  .max(64)
  .regex(/^[a-z0-9_-]+$/i, "Invalid provider");

export const mangaSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  genres: z.array(z.string()).optional(),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]).optional(),
  /** ranked (default) | exact phrase filter */
  match: z.enum(["ranked", "exact"]).optional(),
  /** Subset of allowlist; omit / empty = all */
  providers: z.array(providerSchema).optional(),
});

const externalIdSchema = z.string().min(1, "External id is required").max(512);

export const mangaBookmarkSchema = z.object({
  provider: providerSchema,
  mangaId: externalIdSchema,
});

export const mangaFinishedSchema = z.object({
  provider: providerSchema,
  mangaId: externalIdSchema,
  finished: z.boolean(),
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

export const browseFeedSchema = z.object({
  mode: z.enum(["new", "latest", "trending"]).default("new"),
  period: z.enum(["today", "week", "month"]).default("week"),
  limit: z.number().int().positive().max(50).default(24),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type MangaSearchInput = z.infer<typeof mangaSearchSchema>;
export type BrowseFeedInput = z.infer<typeof browseFeedSchema>;
export type MangaBookmarkInput = z.infer<typeof mangaBookmarkSchema>;
export type MangaFinishedInput = z.infer<typeof mangaFinishedSchema>;
export type ChapterReadInput = z.infer<typeof chapterReadSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;
