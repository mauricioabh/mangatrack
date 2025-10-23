import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const prisma = new PrismaClient();

// Test user email from environment
const testUserEmail = process.env.TEST_USER_EMAIL!;

// Mock manga data (same as in MSW handlers)
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
    status: "ONGOING" as const,
    genres: ["Adventure", "Action", "Comedy", "Shounen"],
    chapters: [
      {
        id: "chapter-1",
        title: "Romance Dawn",
        chapterNumber: 1,
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "chapter-2",
        title: "Against the Four Emperors",
        chapterNumber: 2,
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "chapter-3",
        title: "Morgan vs. Luffy",
        chapterNumber: 3,
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
    status: "COMPLETED" as const,
    genres: ["Action", "Drama", "Horror", "Seinen"],
    chapters: [
      {
        id: "chapter-4",
        title: "To You, in 2000 Years",
        chapterNumber: 1,
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "chapter-5",
        title: "That Day",
        chapterNumber: 2,
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "chapter-6",
        title: "A Dim Light Amid Despair",
        chapterNumber: 3,
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
    ],
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
    status: "COMPLETED" as const,
    genres: ["Action", "Supernatural", "Historical", "Shounen"],
    chapters: [
      {
        id: "chapter-7",
        title: "Cruelty",
        chapterNumber: 1,
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "chapter-8",
        title: "Sakonji Urokodaki",
        chapterNumber: 2,
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
    ],
  },
  {
    id: "clx4567890abcdef123",
    title: "My Hero Academia",
    slug: "my-hero-academia",
    author: "Kohei Horikoshi",
    description:
      "In a world where most people have superpowers, Izuku Midoriya dreams of becoming a hero despite being born without a Quirk.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "ONGOING" as const,
    genres: ["Action", "School", "Superhero", "Shounen"],
    chapters: [
      {
        id: "chapter-9",
        title: "Izuku Midoriya: Origin",
        chapterNumber: 1,
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
    ],
  },
  {
    id: "clx567890abcdef1234",
    title: "Naruto",
    slug: "naruto",
    author: "Masashi Kishimoto",
    description:
      "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "COMPLETED" as const,
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    chapters: [
      {
        id: "chapter-10",
        title: "Uzumaki Naruto",
        chapterNumber: 1,
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Find the user by email from environment variable
    const user = await prisma.user.findUnique({
      where: { email: testUserEmail },
    });

    if (!user) {
      console.error(
        `❌ User with email ${testUserEmail} not found in database. Please make sure the user exists.`
      );
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Clear existing data for this user
    console.log("🧹 Cleaning existing data...");
    await prisma.readingHistory.deleteMany({
      where: { userId: user.id },
    });
    await prisma.userManga.deleteMany({
      where: { userId: user.id },
    });
    await prisma.notification.deleteMany({
      where: { userId: user.id },
    });

    // Create mangas and chapters
    console.log("📚 Creating mangas and chapters...");
    for (const mangaData of mockMangas) {
      const { chapters, ...mangaInfo } = mangaData;

      const manga = await prisma.manga.upsert({
        where: { slug: mangaInfo.slug },
        update: mangaInfo,
        create: mangaInfo,
      });

      console.log(`  ✅ Created manga: ${manga.title}`);

      // Create chapters for this manga
      for (const chapterData of chapters) {
        await prisma.chapter.upsert({
          where: { id: chapterData.id },
          update: {
            ...chapterData,
            mangaId: manga.id,
          },
          create: {
            ...chapterData,
            mangaId: manga.id,
          },
        });
      }
    }

    // Create bookmarks for the first 3 mangas
    console.log("🔖 Creating bookmarks...");
    const bookmarkedMangas = mockMangas.slice(0, 3);
    for (const mangaData of bookmarkedMangas) {
      const manga = await prisma.manga.findUnique({
        where: { slug: mangaData.slug },
      });

      if (manga) {
        await prisma.userManga.create({
          data: {
            userId: user.id,
            mangaId: manga.id,
          },
        });
        console.log(`  ✅ Bookmarked: ${manga.title}`);
      }
    }

    // Create reading history (user has read first 2 chapters of One Piece)
    console.log("📖 Creating reading history...");
    const onePiece = await prisma.manga.findUnique({
      where: { slug: "one-piece" },
      include: { chapters: true },
    });

    if (onePiece) {
      const firstTwoChapters = onePiece.chapters.slice(0, 2);
      for (const chapter of firstTwoChapters) {
        await prisma.readingHistory.create({
          data: {
            userId: user.id,
            mangaId: onePiece.id,
            chapterId: chapter.id,
            readAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ), // Random date within last week
          },
        });
      }
      console.log(
        `  ✅ Created reading history for ${firstTwoChapters.length} chapters of One Piece`
      );
    }

    // Create notifications
    console.log("🔔 Creating notifications...");
    const notifications = [
      {
        type: "NEW_CHAPTER" as const,
        title: "New Chapter Available!",
        message: "One Piece Chapter 1095 is now available to read.",
        mangaId: (
          await prisma.manga.findUnique({ where: { slug: "one-piece" } })
        )?.id,
      },
      {
        type: "NEW_CHAPTER" as const,
        title: "New Chapter Available!",
        message: "My Hero Academia Chapter 412 is now available to read.",
        mangaId: (
          await prisma.manga.findUnique({ where: { slug: "my-hero-academia" } })
        )?.id,
      },
      {
        type: "MANGA_UPDATE" as const,
        title: "Manga Status Update",
        message: "Attack on Titan has been marked as completed.",
        mangaId: (
          await prisma.manga.findUnique({ where: { slug: "attack-on-titan" } })
        )?.id,
      },
    ];

    for (const notification of notifications) {
      if (notification.mangaId) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            mangaId: notification.mangaId,
            read: Math.random() > 0.5, // Random read status
          },
        });
      }
    }

    console.log(`  ✅ Created ${notifications.length} notifications`);

    console.log("🎉 Database seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  • ${mockMangas.length} mangas created`);
    console.log(
      `  • ${mockMangas.reduce(
        (total, manga) => total + manga.chapters.length,
        0
      )} chapters created`
    );
    console.log(`  • ${bookmarkedMangas.length} bookmarks created`);
    console.log(`  • Reading history created for One Piece`);
    console.log(`  • ${notifications.length} notifications created`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
