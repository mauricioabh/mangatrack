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
        Manga: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "cuid",
              description: "Unique manga identifier",
            },
            title: {
              type: "string",
              description: "Manga title",
            },
            slug: {
              type: "string",
              description: "URL-friendly manga identifier",
            },
            description: {
              type: "string",
              nullable: true,
              description: "Manga description/synopsis",
            },
            coverImage: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "Manga cover image URL",
            },
            bannerImage: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "Manga banner image URL",
            },
            status: {
              type: "string",
              enum: ["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"],
              description: "Manga publication status",
            },
            genres: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Manga genres",
            },
            author: {
              type: "string",
              nullable: true,
              description: "Manga author",
            },
            artist: {
              type: "string",
              nullable: true,
              description: "Manga artist",
            },
            releaseDate: {
              type: "string",
              format: "date",
              nullable: true,
              description: "Manga release date",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Manga creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Manga last update timestamp",
            },
          },
          required: ["id", "title", "slug", "status", "genres", "createdAt", "updatedAt"],
        },
        Chapter: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "cuid",
              description: "Unique chapter identifier",
            },
            mangaId: {
              type: "string",
              format: "cuid",
              description: "Parent manga identifier",
            },
            chapterNumber: {
              type: "number",
              format: "float",
              description: "Chapter number",
            },
            title: {
              type: "string",
              nullable: true,
              description: "Chapter title",
            },
            pages: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
              },
              description: "Chapter page URLs",
            },
            releaseDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Chapter release date",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Chapter creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Chapter last update timestamp",
            },
          },
          required: ["id", "mangaId", "chapterNumber", "pages", "createdAt", "updatedAt"],
        },
        UserManga: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "cuid",
              description: "Unique bookmark identifier",
            },
            userId: {
              type: "string",
              format: "cuid",
              description: "User identifier",
            },
            mangaId: {
              type: "string",
              format: "cuid",
              description: "Manga identifier",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Bookmark creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Bookmark last update timestamp",
            },
          },
          required: ["id", "userId", "mangaId", "createdAt", "updatedAt"],
        },
        ReadingHistory: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "cuid",
              description: "Unique reading history identifier",
            },
            userId: {
              type: "string",
              format: "cuid",
              description: "User identifier",
            },
            mangaId: {
              type: "string",
              format: "cuid",
              description: "Manga identifier",
            },
            chapterId: {
              type: "string",
              format: "cuid",
              description: "Chapter identifier",
            },
            readAt: {
              type: "string",
              format: "date-time",
              description: "Reading timestamp",
            },
          },
          required: ["id", "userId", "mangaId", "chapterId", "readAt"],
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
              enum: ["NEW_CHAPTER", "SYSTEM", "PROMOTION"],
              description: "Notification type",
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
