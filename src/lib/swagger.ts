import swaggerJsdoc from "swagger-jsdoc";

/**
 * Swagger configuration for MangaTrack API
 * @see https://swagger.io/specification/
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MangaTrack API",
      version: "1.0.0",
      description: "A clean, minimalist web app for discovering, reading, and tracking manga with automated updates.",
      contact: {
        name: "MangaTrack Team",
        email: "support@mangatrack.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        ClerkAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Clerk authentication token",
        },
      },
      schemas: {
        // Prisma Models
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "cuid",
              description: "Unique user identifier",
            },
            clerkId: {
              type: "string",
              description: "Clerk user identifier",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            name: {
              type: "string",
              nullable: true,
              description: "User display name",
            },
            avatar: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "User avatar URL",
            },
            tier: {
              type: "string",
              enum: ["BASIC", "PREMIUM"],
              description: "User subscription tier",
            },
            stripeCustomerId: {
              type: "string",
              nullable: true,
              description: "Stripe customer ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
          required: ["id", "clerkId", "email", "tier", "createdAt", "updatedAt"],
        },
        MangaListItem: {
          type: "object",
          description: "Manga from MangaDex API (not stored in Neon)",
          properties: {
            id: { type: "string", format: "uuid", description: "MangaDex manga UUID" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            coverImage: { type: "string", format: "uri", nullable: true },
            status: {
              type: "string",
              enum: ["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"],
            },
            genres: { type: "array", items: { type: "string" } },
            author: { type: "string", nullable: true },
          },
          required: ["id", "title", "status", "genres"],
        },
        ChapterListItem: {
          type: "object",
          description: "Chapter from MangaDex feed (not stored in Neon)",
          properties: {
            id: { type: "string", format: "uuid", description: "MangaDex chapter UUID" },
            mangaId: { type: "string", format: "uuid" },
            chapterNumber: { type: "number" },
            title: { type: "string" },
            pages: { type: "integer", description: "Page count metadata" },
          },
          required: ["id", "mangaId", "chapterNumber", "title"],
        },
        UserManga: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            userId: { type: "string", format: "cuid" },
            mangaDexId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "mangaDexId", "createdAt"],
        },
        ReadingHistory: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            userId: { type: "string", format: "cuid" },
            mangaDexId: { type: "string", format: "uuid" },
            chapterDexId: { type: "string", format: "uuid" },
            readAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "mangaDexId", "chapterDexId", "readAt"],
        },
        Notification: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "cuid",
              description: "Unique notification identifier",
            },
            userId: {
              type: "string",
              format: "cuid",
              description: "User identifier",
            },
            type: {
              type: "string",
              enum: ["NEW_CHAPTER", "MANGA_UPDATE", "SYSTEM"],
              description: "Notification type",
            },
            mangaId: {
              type: "string",
              format: "uuid",
              nullable: true,
              description: "MangaDex manga UUID (API alias of mangaDexId)",
            },
            chapterId: {
              type: "string",
              format: "uuid",
              nullable: true,
              description: "MangaDex chapter UUID (API alias of chapterDexId)",
            },
            title: {
              type: "string",
              description: "Notification title",
            },
            message: {
              type: "string",
              description: "Notification message",
            },
            read: {
              type: "boolean",
              description: "Whether notification has been read",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Notification creation timestamp",
            },
          },
          required: ["id", "userId", "type", "title", "message", "read", "createdAt"],
        },
        // API Response Schemas
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Whether the request was successful",
            },
            message: {
              type: "string",
              nullable: true,
              description: "Response message",
            },
            data: {
              type: "object",
              nullable: true,
              description: "Response data",
            },
            error: {
              type: "string",
              nullable: true,
              description: "Error message if request failed",
            },
          },
          required: ["success"],
        },
        PaginationResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Whether the request was successful",
            },
            data: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Response data array",
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "integer",
                  minimum: 1,
                  description: "Current page number",
                },
                limit: {
                  type: "integer",
                  minimum: 1,
                  maximum: 100,
                  description: "Items per page",
                },
                total: {
                  type: "integer",
                  minimum: 0,
                  description: "Total number of items",
                },
                pages: {
                  type: "integer",
                  minimum: 0,
                  description: "Total number of pages",
                },
              },
              required: ["page", "limit", "total", "pages"],
            },
          },
          required: ["success", "data", "pagination"],
        },
        // Error Schemas
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                  },
                  expected: {
                    type: "string",
                  },
                  received: {
                    type: "string",
                  },
                  path: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
          required: ["success", "error"],
        },
      },
    },
    security: [
      {
        ClerkAuth: [],
      },
    ],
  },
  apis: [
    "./src/app/api/**/*.ts", // Path to the API files
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
