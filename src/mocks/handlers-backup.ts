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
        id: "1",
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
        id: "2",
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
        id: "3",
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
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "2",
    title: "Attack on Titan",
    slug: "attack-on-titan",
    author: "Hajime Isayama",
    description:
      "Humanity fights for survival against the Titans, giant humanoid creatures that devour humans seemingly without reason.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Drama", "Horror", "Seinen"],
    chapters: [
      {
        id: "4",
        chapterNumber: 1,
        title: "To You, in 2000 Years",
        pages: [
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "5",
        chapterNumber: 2,
        title: "That Day",
        pages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop",
          "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=1200&fit=crop",
        ],
      },
      {
        id: "6",
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
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-11-15"),
  },
  {
    id: "3",
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
      { id: "7", chapterNumber: 1, title: "Cruelty", pages: 19 },
      { id: "8", chapterNumber: 2, title: "Sakonji Urokodaki", pages: 21 },
      { id: "9", chapterNumber: 3, title: "Sabito and Makomo", pages: 23 },
    ],
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2024-10-30"),
  },
  {
    id: "4",
    title: "My Hero Academia",
    slug: "my-hero-academia",
    author: "Kohei Horikoshi",
    description:
      "In a world where most people have superpowers, Izuku Midoriya dreams of becoming a hero despite being born without a Quirk.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "School", "Superhero", "Shounen"],
    chapters: [
      {
        id: "10",
        chapterNumber: 1,
        title: "Izuku Midoriya: Origin",
        pages: 54,
      },
      { id: "11", chapterNumber: 2, title: "Rage, You Damn Nerd", pages: 19 },
      { id: "12", chapterNumber: 3, title: "What I Can Do for Now", pages: 19 },
    ],
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2024-12-15"),
  },
  {
    id: "5",
    title: "Naruto",
    slug: "naruto",
    author: "Masashi Kishimoto",
    description:
      "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Adventure", "Martial Arts", "Shounen"],
    chapters: [
      { id: "13", chapterNumber: 1, title: "Uzumaki Naruto", pages: 53 },
      { id: "14", chapterNumber: 2, title: "Konohamaru", pages: 19 },
      { id: "15", chapterNumber: 3, title: "Sasuke Uchiha", pages: 19 },
    ],
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2024-09-30"),
  },
  {
    id: "6",
    title: "Dragon Ball Z",
    slug: "dragon-ball-z",
    author: "Akira Toriyama",
    description:
      "Goku and his friends defend Earth against various villains, including Saiyans, Frieza, and androids.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Adventure", "Comedy", "Shounen"],
    chapters: [
      { id: "16", chapterNumber: 1, title: "The New Threat", pages: 19 },
      { id: "17", chapterNumber: 2, title: "Reunions", pages: 19 },
      { id: "18", chapterNumber: 3, title: "The Saiyans Arrive", pages: 19 },
    ],
    createdAt: new Date("2023-03-15"),
    updatedAt: new Date("2024-08-15"),
  },
  {
    id: "7",
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    author: "Gege Akutami",
    description:
      "Yuji Itadori joins his school's Occult Club and becomes involved in the world of curses and sorcerers.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Supernatural", "School", "Shounen"],
    chapters: [
      { id: "19", chapterNumber: 1, title: "Ryomen Sukuna", pages: 20 },
      { id: "20", chapterNumber: 2, title: "For Myself", pages: 18 },
      { id: "21", chapterNumber: 3, title: "Girl of Steel", pages: 22 },
    ],
    createdAt: new Date("2023-04-01"),
    updatedAt: new Date("2024-12-10"),
  },
  {
    id: "8",
    title: "Tokyo Ghoul",
    slug: "tokyo-ghoul",
    author: "Sui Ishida",
    description:
      "Ken Kaneki becomes a half-ghoul after a date gone wrong and must navigate the dangerous world of ghouls and humans.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Drama", "Horror", "Seinen"],
    chapters: [
      { id: "22", chapterNumber: 1, title: "Tragedy", pages: 25 },
      { id: "23", chapterNumber: 2, title: "Incubation", pages: 23 },
      { id: "24", chapterNumber: 3, title: "Dove", pages: 21 },
    ],
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2024-07-20"),
  },
  {
    id: "9",
    title: "Death Note",
    slug: "death-note",
    author: "Tsugumi Ohba",
    description:
      "Light Yagami finds a mysterious notebook that allows him to kill anyone by writing their name in it.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Mystery", "Psychological", "Supernatural", "Shounen"],
    chapters: [
      { id: "25", chapterNumber: 1, title: "Boredom", pages: 30 },
      { id: "26", chapterNumber: 2, title: "L", pages: 28 },
      { id: "27", chapterNumber: 3, title: "Family", pages: 26 },
    ],
    createdAt: new Date("2023-05-01"),
    updatedAt: new Date("2024-06-15"),
  },
  {
    id: "10",
    title: "Fullmetal Alchemist",
    slug: "fullmetal-alchemist",
    author: "Hiromu Arakawa",
    description:
      "Two brothers search for the Philosopher's Stone to restore their bodies after a failed alchemy experiment.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Adventure", "Drama", "Shounen"],
    chapters: [
      { id: "28", chapterNumber: 1, title: "The Two Alchemists", pages: 32 },
      { id: "29", chapterNumber: 2, title: "The Price of Life", pages: 30 },
      { id: "30", chapterNumber: 3, title: "Mother", pages: 28 },
    ],
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2024-05-30"),
  },
  {
    id: "11",
    title: "Bleach",
    slug: "bleach",
    author: "Tite Kubo",
    description:
      "Ichigo Kurosaki becomes a Soul Reaper and must protect the living world from evil spirits.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Supernatural", "School", "Shounen"],
    chapters: [
      { id: "31", chapterNumber: 1, title: "Death & Strawberry", pages: 24 },
      { id: "32", chapterNumber: 2, title: "Goodbye Parakeet", pages: 22 },
      { id: "33", chapterNumber: 3, title: "Memories in the Rain", pages: 20 },
    ],
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-04-20"),
  },
  {
    id: "12",
    title: "Hunter x Hunter",
    slug: "hunter-x-hunter",
    author: "Yoshihiro Togashi",
    description:
      "Gon Freecss embarks on a journey to become a Hunter and find his missing father.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy", "Shounen"],
    chapters: [
      {
        id: "34",
        chapterNumber: 1,
        title: "Departure x And x Friends",
        pages: 26,
      },
      { id: "35", chapterNumber: 2, title: "Test x Of x Tests", pages: 24 },
      { id: "36", chapterNumber: 3, title: "Rivals x In x Love", pages: 22 },
    ],
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2024-11-25"),
  },
  {
    id: "13",
    title: "Chainsaw Man",
    slug: "chainsaw-man",
    author: "Tatsuki Fujimoto",
    description:
      "Denji merges with his pet devil-dog to become Chainsaw Man and work as a devil hunter.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Horror", "Supernatural", "Seinen"],
    chapters: [
      { id: "37", chapterNumber: 1, title: "Dog & Chainsaw", pages: 28 },
      { id: "38", chapterNumber: 2, title: "Arrival in Tokyo", pages: 26 },
      { id: "39", chapterNumber: 3, title: "Meowy's Whereabouts", pages: 24 },
    ],
    createdAt: new Date("2023-07-01"),
    updatedAt: new Date("2024-12-05"),
  },
  {
    id: "14",
    title: "Spy x Family",
    slug: "spy-x-family",
    author: "Tatsuya Endo",
    description:
      "A spy creates a fake family for a mission, but his adopted daughter is a telepath and his wife is an assassin.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Comedy", "Family", "Shounen"],
    chapters: [
      { id: "40", chapterNumber: 1, title: "Mission: 01", pages: 20 },
      { id: "41", chapterNumber: 2, title: "Mission: 02", pages: 18 },
      { id: "42", chapterNumber: 3, title: "Mission: 03", pages: 22 },
    ],
    createdAt: new Date("2023-07-15"),
    updatedAt: new Date("2024-11-30"),
  },
  {
    id: "15",
    title: "Black Clover",
    slug: "black-clover",
    author: "Yuki Tabata",
    description:
      "Asta, a boy born without magic, dreams of becoming the Wizard King in a world where magic is everything.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Magic", "Shounen"],
    chapters: [
      { id: "43", chapterNumber: 1, title: "Asta and Yuno", pages: 25 },
      { id: "44", chapterNumber: 2, title: "The Wizard King", pages: 23 },
      { id: "45", chapterNumber: 3, title: "The Black Bulls", pages: 21 },
    ],
    createdAt: new Date("2023-08-01"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "16",
    title: "The Promised Neverland",
    slug: "the-promised-neverland",
    author: "Kaiu Shirai",
    description:
      "Emma and her friends discover the dark truth about their orphanage and plan their escape.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Mystery", "Psychological", "Thriller", "Shounen"],
    chapters: [
      { id: "46", chapterNumber: 1, title: "121045", pages: 30 },
      { id: "47", chapterNumber: 2, title: "131045", pages: 28 },
      { id: "48", chapterNumber: 3, title: "181045", pages: 26 },
    ],
    createdAt: new Date("2023-08-15"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "17",
    title: "Dr. Stone",
    slug: "dr-stone",
    author: "Riichiro Inagaki",
    description:
      "After humanity is petrified for 3700 years, Senku Ishigami awakens and plans to rebuild civilization with science.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Adventure", "Comedy", "Sci-Fi", "Shounen"],
    chapters: [
      { id: "49", chapterNumber: 1, title: "Stone World", pages: 24 },
      {
        id: "50",
        chapterNumber: 2,
        title: "King of the Stone World",
        pages: 22,
      },
      { id: "51", chapterNumber: 3, title: "Weapons of Science", pages: 20 },
    ],
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2024-02-28"),
  },
  {
    id: "18",
    title: "Mob Psycho 100",
    slug: "mob-psycho-100",
    author: "ONE",
    description:
      "Shigeo Kageyama, a middle schooler with psychic powers, tries to live a normal life despite his abilities.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Action", "Comedy", "Supernatural", "Shounen"],
    chapters: [
      {
        id: "52",
        chapterNumber: 1,
        title: "Self-Proclaimed Psychic",
        pages: 26,
      },
      { id: "53", chapterNumber: 2, title: "Doubts About Youth", pages: 24 },
      { id: "54", chapterNumber: 3, title: "Ochimusha", pages: 22 },
    ],
    createdAt: new Date("2023-09-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "19",
    title: "Vinland Saga",
    slug: "vinland-saga",
    author: "Makoto Yukimura",
    description:
      "Thorfinn seeks revenge against Askeladd, the man who killed his father, in this Viking epic.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Historical", "Seinen"],
    chapters: [
      { id: "55", chapterNumber: 1, title: "Somewhere Not Here", pages: 32 },
      {
        id: "56",
        chapterNumber: 2,
        title: "The Battle of London Bridge",
        pages: 30,
      },
      {
        id: "57",
        chapterNumber: 3,
        title: "The End of the Prologue",
        pages: 28,
      },
    ],
    createdAt: new Date("2023-10-01"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    id: "20",
    title: "Berserk",
    slug: "berserk",
    author: "Kentaro Miura",
    description:
      "Guts, a lone mercenary, seeks revenge against his former friend Griffith in this dark fantasy epic.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Dark Fantasy", "Seinen"],
    chapters: [
      { id: "58", chapterNumber: 1, title: "The Black Swordsman", pages: 35 },
      { id: "59", chapterNumber: 2, title: "The Brand", pages: 33 },
      {
        id: "60",
        chapterNumber: 3,
        title: "The Guardians of Desire",
        pages: 31,
      },
    ],
    createdAt: new Date("2023-10-15"),
    updatedAt: new Date("2024-08-30"),
  },
  {
    id: "21",
    title: "One Punch Man",
    slug: "one-punch-man",
    author: "ONE",
    description:
      "Saitama can defeat any opponent with a single punch, but his overwhelming strength has left him bored.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Comedy", "Superhero", "Seinen"],
    chapters: [
      { id: "61", chapterNumber: 1, title: "One Punch", pages: 20 },
      {
        id: "62",
        chapterNumber: 2,
        title: "Crab and Natural Disasters",
        pages: 18,
      },
      { id: "63", chapterNumber: 3, title: "The Strongest Man", pages: 22 },
    ],
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2024-07-10"),
  },
  {
    id: "22",
    title: "Haikyuu!!",
    slug: "haikyuu",
    author: "Haruichi Furudate",
    description:
      "Shoyo Hinata joins his school's volleyball team and dreams of becoming the best player despite his short height.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Sports", "School", "Comedy", "Shounen"],
    chapters: [
      {
        id: "64",
        chapterNumber: 1,
        title: "The End and the Beginning",
        pages: 24,
      },
      {
        id: "65",
        chapterNumber: 2,
        title: "Karasuno High School Volleyball Club",
        pages: 22,
      },
      { id: "66", chapterNumber: 3, title: "The View from the Top", pages: 20 },
    ],
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2024-05-15"),
  },
  {
    id: "23",
    title: "Kaguya-sama: Love is War",
    slug: "kaguya-sama-love-is-war",
    author: "Aka Akasaka",
    description:
      "Two student council members try to make the other confess their love first in this romantic comedy.",
    coverImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Romance", "Comedy", "School", "Shounen"],
    chapters: [
      {
        id: "67",
        chapterNumber: 1,
        title: "I Want to Make You Invite Me to a Movie",
        pages: 18,
      },
      {
        id: "68",
        chapterNumber: 2,
        title: "I Want to Make You Say It",
        pages: 16,
      },
      {
        id: "69",
        chapterNumber: 3,
        title: "I Want to Make You Say It Again",
        pages: 20,
      },
    ],
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2024-04-05"),
  },
  {
    id: "24",
    title: "JoJo's Bizarre Adventure",
    slug: "jojos-bizarre-adventure",
    author: "Hirohiko Araki",
    description:
      "The epic saga of the Joestar family across multiple generations, each with their own unique adventures.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Supernatural", "Shounen"],
    chapters: [
      { id: "70", chapterNumber: 1, title: "Dio the Invader", pages: 40 },
      {
        id: "71",
        chapterNumber: 2,
        title: "A Letter from the Past",
        pages: 38,
      },
      { id: "72", chapterNumber: 3, title: "Youth with Dio", pages: 36 },
    ],
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2024-06-20"),
  },
  {
    id: "25",
    title: "Slam Dunk",
    slug: "slam-dunk",
    author: "Takehiko Inoue",
    description:
      "Hanamichi Sakuragi joins his school's basketball team to impress a girl and discovers his love for the sport.",
    coverImage:
      "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=400&fit=crop",
    status: "Completed",
    genres: ["Sports", "School", "Comedy", "Shounen"],
    chapters: [
      { id: "73", chapterNumber: 1, title: "Sakuragi Hanamichi", pages: 28 },
      { id: "74", chapterNumber: 2, title: "The Basketball Team", pages: 26 },
      { id: "75", chapterNumber: 3, title: "The Rookie", pages: 24 },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-03-25"),
  },
];

// Mock user data
const mockUser = {
  id: "user-1",
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
    id: "bookmark-1",
    userId: "user-1",
    mangaId: "1",
    manga: mockMangas[0],
    createdAt: new Date("2024-11-01"),
  },
  {
    id: "bookmark-2",
    userId: "user-1",
    mangaId: "2",
    manga: mockMangas[1],
    createdAt: new Date("2024-11-15"),
  },
  {
    id: "bookmark-3",
    userId: "user-1",
    mangaId: "3",
    manga: mockMangas[2],
    createdAt: new Date("2024-12-01"),
  },
];

// Mock reading history
const mockReadingHistory = [
  {
    id: "history-1",
    userId: "user-1",
    mangaId: "1",
    chapterId: "1",
    manga: mockMangas[0],
    chapter: mockMangas[0].chapters[0],
    chapterNumber: 1,
    readAt: new Date("2024-12-01"),
  },
  {
    id: "history-2",
    userId: "user-1",
    mangaId: "1",
    chapterId: "2",
    manga: mockMangas[0],
    chapter: mockMangas[0].chapters[1],
    chapterNumber: 2,
    readAt: new Date("2024-12-02"),
  },
  {
    id: "history-3",
    userId: "user-1",
    mangaId: "2",
    chapterId: "4",
    manga: mockMangas[1],
    chapter: mockMangas[1].chapters[0],
    chapterNumber: 1,
    readAt: new Date("2024-11-30"),
  },
];

// Mock notifications
const mockNotifications = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "NEW_CHAPTER",
    title: "New Chapter Available",
    message: "One Piece Chapter 1096 is now available!",
    mangaId: "1",
    manga: mockMangas[0],
    read: false,
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "BOOKMARK_UPDATE",
    title: "Manga Update",
    message: "Attack on Titan has been completed!",
    mangaId: "2",
    manga: mockMangas[1],
    read: false,
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
      id: `bookmark-${Date.now()}`,
      userId: "user-1",
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
  http.get("/api/reading-history", () => {
    return HttpResponse.json({
      success: true,
      data: mockReadingHistory,
    });
  }),

  // Add reading history
  http.post("/api/reading-history", async ({ request }) => {
    const body = (await request.json()) as {
      mangaId: string;
      chapterId: string;
    };
    const manga = mockMangas.find((m) => m.id === body.mangaId);
    const chapter = manga?.chapters.find((c) => c.id === body.chapterId);

    if (!manga || !chapter) {
      return HttpResponse.json(
        { success: false, error: "Manga or chapter not found" },
        { status: 404 }
      );
    }

    const newHistory = {
      id: `history-${Date.now()}`,
      userId: "user-1",
      mangaId: body.mangaId,
      chapterId: body.chapterId,
      manga,
      chapter,
      chapterNumber: chapter.chapterNumber,
      readAt: new Date(),
    };

    // Remove existing history for this chapter
    const existingIndex = mockReadingHistory.findIndex(
      (h) => h.mangaId === body.mangaId && h.chapterId === body.chapterId
    );
    if (existingIndex !== -1) {
      mockReadingHistory.splice(existingIndex, 1);
    }

    mockReadingHistory.unshift(newHistory);

    return HttpResponse.json({
      success: true,
      data: newHistory,
    });
  }),

  // Get user profile
  http.get("/api/user/profile", () => {
    console.log("🎭 MSW: Intercepting /api/user/profile request");
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // Get notifications
  http.get("/api/notifications", ({ request }) => {
    console.log("🎭 MSW: Intercepting /api/notifications request");

    // Get the current user ID from the request headers or use a default
    // In a real scenario, this would come from the authentication token
    const currentUserId = "user-1"; // This should match the mock user ID

    // Filter notifications for the current user
    const userNotifications = mockNotifications.filter(
      (notification) => notification.userId === currentUserId
    );

    return HttpResponse.json({
      success: true,
      data: userNotifications,
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

  // Get chapter details
  http.get("/api/chapters/:chapterId", ({ params }) => {
    console.log(
      "🎭 MSW: Intercepting /api/chapters request for:",
      params.chapterId
    );
    const { chapterId } = params;
    const chapter = mockMangas
      .flatMap((manga) => manga.chapters)
      .find((chapter) => chapter.id === chapterId);

    if (!chapter) {
      return HttpResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Find the manga that contains this chapter
    const manga = mockMangas.find((m) =>
      m.chapters.some((c) => c.id === chapterId)
    );

    if (!manga) {
      return HttpResponse.json(
        { success: false, error: "Manga not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      chapter,
      manga,
      chapters: manga.chapters,
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
      (bookmark) => bookmark.mangaId === mangaId && bookmark.userId === "user-1"
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

    if (!mangaId) {
      return HttpResponse.json(
        { success: false, error: "Manga ID is required" },
        { status: 400 }
      );
    }

    const history = mockReadingHistory.filter(
      (entry) => entry.mangaId === mangaId && entry.userId === "user-1"
    );

    return HttpResponse.json({
      success: true,
      data: history,
    });
  }),
];
