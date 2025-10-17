import { http, HttpResponse } from "msw";

// Mock manga data - Extensive collection of popular manga
const mockMangas = [
  {
    id: "clx1234567890abcdef",
    title: "One Piece",
    slug: "one-piece",
    author: "Eiichiro Oda",
    description:
      'Follow Monkey D. Luffy and his pirate crew as they search for the ultimate treasure known as "One Piece" to become the next Pirate King.',
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Adventure", "Action", "Comedy", "Shounen"],
    chapters: [
      {
        id: "clx1111111111111111",
        chapterNumber: 1,
        title: "Romance Dawn",
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "clx2222222222222222",
        chapterNumber: 2,
        title: "Against the Four Emperors",
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "clx3333333333333333",
        chapterNumber: 3,
        title: "Morgan vs. Luffy",
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "clx234567890abcdef1",
    title: "Attack on Titan",
    slug: "attack-on-titan",
    author: "Hajime Isayama",
    description:
      "Humanity fights for survival against the Titans, giant humanoid creatures that devour humans seemingly without reason.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Drama", "Horror", "Military"],
    chapters: [
      {
        id: "clx4444444444444444",
        chapterNumber: 1,
        title: "To You, in 2000 Years",
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "clx5555555555555555",
        chapterNumber: 2,
        title: "That Day",
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "clx6666666666666666",
        chapterNumber: 3,
        title: "A Dim Light Amid Despair",
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-11-15"),
  },
  {
    id: "clx34567890abcdef12",
    title: "Demon Slayer",
    slug: "demon-slayer",
    author: "Koyoharu Gotouge",
    description:
      "Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister Nezuko is turned into a demon.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Supernatural", "Historical", "Shounen"],
    chapters: [
      { id: "clx7777777777777777", chapterNumber: 1, title: "Cruelty", pages: 19 },
      { id: "clx8888888888888888", chapterNumber: 2, title: "Sakonji Urokodaki", pages: 21 },
      { id: "clx9999999999999999", chapterNumber: 3, title: "Sabito and Makomo", pages: 23 },
    ],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-14"),
  },
  {
    id: "clx4567890abcdef123",
    title: "My Hero Academia",
    slug: "my-hero-academia",
    author: "Kohei Horikoshi",
    description:
      "In a world where most people have superpowers, a boy without any powers dreams of becoming a hero.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "School", "Superhero", "Shounen"],
    chapters: [
      {
        id: "clx0000000000000000",
        chapterNumber: 1,
        title: "Izuku Midoriya: Origin",
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      { id: "clx1111111111111112", chapterNumber: 2, title: "Rage, You Damn Nerd", pages: 19 },
      { id: "clx2222222222222223", chapterNumber: 3, title: "What I Can Do for Now", pages: 19 },
    ],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "clx567890abcdef1234",
    title: "Naruto",
    slug: "naruto",
    author: "Masashi Kishimoto",
    description:
      "A young ninja seeks recognition from his peers and dreams of becoming the Hokage, the leader of his village.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    chapters: [
      { id: "clx3333333333333334", chapterNumber: 1, title: "Uzumaki Naruto", pages: 53 },
      { id: "clx4444444444444445", chapterNumber: 2, title: "Konohamaru", pages: 19 },
      { id: "clx5555555555555556", chapterNumber: 3, title: "Sasuke Uchiha", pages: 19 },
    ],
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-11-10"),
  },
  {
    id: "clx67890abcdef12345",
    title: "Dragon Ball Z",
    slug: "dragon-ball-z",
    author: "Akira Toriyama",
    description:
      "Goku and his friends defend Earth against powerful enemies from across the universe.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    chapters: [
      { id: "clx6666666666666667", chapterNumber: 1, title: "The New Threat", pages: 19 },
      { id: "clx7777777777777778", chapterNumber: 2, title: "Reunions", pages: 19 },
      { id: "clx8888888888888889", chapterNumber: 3, title: "The Saiyans Arrive", pages: 19 },
    ],
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-10-20"),
  },
];

// Mock user data
const mockUser = {
  id: "clxuser1234567890ab",
  clerkId: "clerk-user-1",
  email: "user@example.com",
  name: "John Doe",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  tier: "BASIC",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-12-01"),
};

// Mock bookmarks
const mockBookmarks = [
  {
    id: "clxbookmark123456789",
    userId: "clxuser1234567890ab",
    mangaId: "clx1234567890abcdef",
    manga: mockMangas[0],
    createdAt: new Date("2024-11-01"),
  },
  {
    id: "clxbookmark234567890",
    userId: "clxuser1234567890ab",
    mangaId: "clx234567890abcdef1",
    manga: mockMangas[1],
    createdAt: new Date("2024-11-15"),
  },
  {
    id: "clxbookmark345678901",
    userId: "clxuser1234567890ab",
    mangaId: "clx34567890abcdef12",
    manga: mockMangas[2],
    createdAt: new Date("2024-12-01"),
  },
];

// Mock reading history
const mockReadingHistory = [
  {
    id: "clxhistory123456789",
    userId: "clxuser1234567890ab",
    mangaId: "clx1234567890abcdef",
    chapterId: "clx1111111111111111",
    chapterNumber: 1,
    readAt: new Date("2024-11-01"),
  },
  {
    id: "clxhistory234567890",
    userId: "clxuser1234567890ab",
    mangaId: "clx34567890abcdef12",
    chapterId: "clx7777777777777777",
    chapterNumber: 1,
    readAt: new Date("2024-12-01"),
  },
];

// Mock notifications
const mockNotifications = [
  {
    id: "clxnotif1234567890",
    userId: "clxuser1234567890ab",
    title: "New Chapter Available",
    message: "Chapter 100 of One Piece is now available!",
    type: "CHAPTER_UPDATE",
    read: false,
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "clxnotif2345678901",
    userId: "clxuser1234567890ab",
    title: "Welcome to MangaTrack",
    message: "Thanks for joining! Start exploring your favorite manga.",
    type: "WELCOME",
    read: true,
    createdAt: new Date("2024-11-30"),
  },
];

export const handlers = [
  // Manga search endpoint
  http.get("/api/manga/search", ({ request }) => {
    const url = new URL(request.url);
    const query =
      url.searchParams.get("query") || url.searchParams.get("q") || "";
    const genre = url.searchParams.get("genre") || "";
    const status = url.searchParams.get("status") || "";

    let filteredMangas = [...mockMangas]; // Create a copy to avoid mutating original

    // Search by title, author, or description
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredMangas = filteredMangas.filter(
        (manga) =>
          manga.title.toLowerCase().includes(searchTerm) ||
          manga.author.toLowerCase().includes(searchTerm) ||
          manga.description.toLowerCase().includes(searchTerm) ||
          manga.genres.some((g) => g.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by genre
    if (genre && genre !== "all") {
      filteredMangas = filteredMangas.filter((manga) =>
        manga.genres.includes(genre)
      );
    }

    // Filter by status
    if (status && status !== "all") {
      filteredMangas = filteredMangas.filter(
        (manga) => manga.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Sort by relevance (exact title matches first, then partial matches)
    if (query) {
      filteredMangas.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const searchTerm = query.toLowerCase();

        if (aTitle === searchTerm) return -1;
        if (bTitle === searchTerm) return 1;
        if (aTitle.startsWith(searchTerm)) return -1;
        if (bTitle.startsWith(searchTerm)) return 1;
        return 0;
      });
    }

    return HttpResponse.json({
      success: true,
      data: filteredMangas,
      total: filteredMangas.length,
    });
  }),

  // Get all manga (for browse/discover page)
  http.get("/api/manga", () => {
    return HttpResponse.json({
      success: true,
      data: mockMangas,
      total: mockMangas.length,
    });
  }),

  // Get user bookmarks (must come before /api/manga/:slug to avoid conflicts)
  http.get("/api/manga/bookmarks", () => {
    console.log("🎭 MSW: Intercepting /api/manga/bookmarks request");
    console.log("🎭 MSW: Returning bookmarks:", mockBookmarks.length, "items");
    return HttpResponse.json({
      success: true,
      data: mockBookmarks,
    });
  }),

  // Get manga by slug
  http.get("/api/manga/:slug", ({ params }) => {
    const { slug } = params;
    const manga = mockMangas.find((m) => m.slug === slug);

    if (!manga) {
      return HttpResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: manga,
    });
  }),

  // Add bookmark
  http.post("/api/manga/bookmark", async ({ request }) => {
    const body = (await request.json()) as { mangaId: string };
    const manga = mockMangas.find((m) => m.id === body.mangaId);

    if (!manga) {
      return HttpResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    const newBookmark = {
      id: `clxbookmark${Date.now()}`,
      userId: "clxuser1234567890ab",
      mangaId: body.mangaId,
      manga,
      createdAt: new Date(),
    };

    mockBookmarks.push(newBookmark);

    return HttpResponse.json({
      success: true,
      data: newBookmark,
    });
  }),

  // Remove bookmark
  http.delete("/api/manga/bookmark", async ({ request }) => {
    const body = (await request.json()) as { mangaId: string };
    const index = mockBookmarks.findIndex((b) => b.mangaId === body.mangaId);

    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: "Bookmark not found" },
        { status: 404 }
      );
    }

    mockBookmarks.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  }),

  // Get reading history
  http.get("/api/reading-history", ({ request }) => {
    const url = new URL(request.url);
    const mangaId = url.searchParams.get("mangaId");

    let filteredHistory = [...mockReadingHistory];

    if (mangaId) {
      filteredHistory = filteredHistory.filter((h) => h.mangaId === mangaId);
    }

    return HttpResponse.json({
      success: true,
      data: filteredHistory,
    });
  }),

  // Add reading history
  http.post("/api/reading-history", async ({ request }) => {
    const body = (await request.json()) as {
      mangaId: string;
      chapterId: string;
      chapterNumber: number;
    };

    const newHistory = {
      id: `clxhistory${Date.now()}`,
      userId: "clxuser1234567890ab",
      mangaId: body.mangaId,
      chapterId: body.chapterId,
      chapterNumber: body.chapterNumber,
      readAt: new Date(),
    };

    // Remove existing history for this chapter and add new one
    const existingIndex = mockReadingHistory.findIndex(
      (h) => h.mangaId === body.mangaId && h.chapterId === body.chapterId
    );

    if (existingIndex !== -1) {
      mockReadingHistory[existingIndex] = newHistory;
    } else {
      mockReadingHistory.push(newHistory);
    }

    return HttpResponse.json({
      success: true,
      data: newHistory,
    });
  }),

  // Get user profile
  http.get("/api/user/profile", () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  // Get notifications
  http.get("/api/notifications", () => {
    return HttpResponse.json({
      success: true,
      data: mockNotifications,
    });
  }),

  // Mark notification as read
  http.patch("/api/notifications/:id/read", ({ params }) => {
    const { id } = params;
    const notification = mockNotifications.find((n) => n.id === id);

    if (!notification) {
      return HttpResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    notification.read = true;

    return HttpResponse.json({
      success: true,
      data: notification,
    });
  }),

  // Get chapter by ID
  http.get("/api/chapters/:chapterId", ({ params }) => {
    const { chapterId } = params;
    let chapter = null;
    let manga = null;

    // Find the chapter in any manga
    for (const m of mockMangas) {
      const foundChapter = m.chapters.find((c) => c.id === chapterId);
      if (foundChapter) {
        chapter = foundChapter;
        manga = m;
        break;
      }
    }

    if (!chapter || !manga) {
      return HttpResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...chapter,
        manga,
        chapters: manga.chapters,
      },
    });
  }),

  // Get bookmark status for a specific manga
  http.get("/api/manga/bookmark", ({ request }) => {
    const url = new URL(request.url);
    const mangaId = url.searchParams.get("mangaId");

    if (!mangaId) {
      return HttpResponse.json(
        { success: false, error: "Manga ID is required" },
        { status: 400 }
      );
    }

    const isBookmarked = mockBookmarks.some(
      (bookmark) => bookmark.mangaId === mangaId && bookmark.userId === "clxuser1234567890ab"
    );

    return HttpResponse.json({
      success: true,
      isBookmarked,
    });
  }),

  // Get reading history for a specific manga
  http.get("/api/reading-history", ({ request }) => {
    const url = new URL(request.url);
    const mangaId = url.searchParams.get("mangaId");

    let filteredHistory = [...mockReadingHistory];

    if (mangaId) {
      filteredHistory = filteredHistory.filter((h) => h.mangaId === mangaId);
    }

    return HttpResponse.json({
      success: true,
      data: filteredHistory,
    });
  }),
];
