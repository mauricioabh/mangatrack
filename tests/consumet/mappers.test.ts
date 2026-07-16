import {
  buildChapterPageProxyPaths,
  getChapterNeighbors,
  mapChapter,
  mapMangaDetail,
  mapPages,
  mapSearchResult,
  mapStatus,
  resolveTitle,
} from "@/lib/consumet/mappers";

describe("consumet mappers", () => {
  describe("mapStatus", () => {
    it("maps ongoing / publishing / complete / hiatus / cancel", () => {
      expect(mapStatus("Ongoing")).toBe("ONGOING");
      expect(mapStatus("Publishing")).toBe("ONGOING");
      expect(mapStatus("Completed")).toBe("COMPLETED");
      expect(mapStatus("Hiatus")).toBe("HIATUS");
      expect(mapStatus("Cancelled")).toBe("CANCELLED");
    });

    it("defaults unknown or empty to ONGOING", () => {
      expect(mapStatus(undefined)).toBe("ONGOING");
      expect(mapStatus("")).toBe("ONGOING");
      expect(mapStatus("mystery")).toBe("ONGOING");
    });
  });

  describe("resolveTitle", () => {
    it("prefers primary title then altTitles then fallback", () => {
      expect(resolveTitle("One Piece")).toBe("One Piece");
      expect(resolveTitle(null, ["Alt Title"])).toBe("Alt Title");
      expect(resolveTitle(null, [{ en: "EN Alt" }])).toBe("EN Alt");
      expect(resolveTitle(null, [], "Fallback")).toBe("Fallback");
      expect(resolveTitle(null)).toBe("Untitled");
    });
  });

  describe("mapSearchResult", () => {
    it("maps search hit with provider and cover referer", () => {
      const item = mapSearchResult(
        {
          id: "one_piece",
          title: "One Piece",
          description: "Pirates",
          image: "http://cdn.example/cover.jpg",
          status: "Ongoing",
          headerForImage: { Referer: "https://mangahere.cc" },
        },
        "mangahere"
      );

      expect(item).toMatchObject({
        id: "one_piece",
        provider: "mangahere",
        title: "One Piece",
        status: "ONGOING",
        coverImage: "http://cdn.example/cover.jpg",
        coverReferer: "https://mangahere.cc",
        genres: [],
      });
    });
  });

  describe("mapChapter", () => {
    it("uses chapterNumber when present", () => {
      const ch = mapChapter(
        { id: "one_piece/1", title: "Chapter 1", chapterNumber: "1" },
        "one_piece"
      );
      expect(ch).toMatchObject({
        id: "one_piece/1",
        mangaId: "one_piece",
        chapterNumber: 1,
        title: "Chapter 1",
      });
    });

    it("parses chapter number from title when missing", () => {
      const ch = mapChapter(
        { id: "x", title: "Ch. 42 - Battle" },
        "manga"
      );
      expect(ch.chapterNumber).toBe(42);
      expect(ch.title).toBe("Ch. 42 - Battle");
    });
  });

  describe("mapMangaDetail", () => {
    it("maps info payload including chapters and genres", () => {
      const detail = mapMangaDetail(
        {
          id: "one_piece",
          title: "One Piece",
          description: "A pirate adventure.",
          image: "http://cdn.example/cover.jpg",
          status: "Ongoing",
          genres: ["Action", "Adventure"],
          authors: ["Eiichiro Oda"],
          artist: "Eiichiro Oda",
          headers: { Referer: "https://mangahere.cc" },
          chapters: [
            { id: "one_piece/2", title: "Ch. 2", chapterNumber: "2" },
            { id: "one_piece/1", title: "Ch. 1", chapterNumber: "1" },
          ],
        },
        "mangahere"
      );

      expect(detail.provider).toBe("mangahere");
      expect(detail.author).toBe("Eiichiro Oda");
      expect(detail.genres).toEqual(["Action", "Adventure"]);
      expect(detail.chapters).toHaveLength(2);
      expect(detail.coverReferer).toBe("https://mangahere.cc");
    });
  });

  describe("mapPages", () => {
    it("maps page urls and sorts by index", () => {
      const pages = mapPages([
        { img: "https://cdn/p2.jpg", page: 2 },
        { img: "https://cdn/p1.jpg", page: 1, headerForImage: { Referer: "https://x" } },
      ]);
      expect(pages.map((p) => p.index)).toEqual([1, 2]);
      expect(pages[0].referer).toBe("https://x");
    });

    it("skips entries without img", () => {
      expect(mapPages([{ page: 0 }])).toEqual([]);
    });
  });

  describe("getChapterNeighbors", () => {
    const chapters = [
      { id: "newest" },
      { id: "mid" },
      { id: "oldest" },
    ];

    it("returns previous (older) and next (newer) in newest-first lists", () => {
      expect(getChapterNeighbors(chapters, "mid")).toEqual({
        previous: { id: "oldest" },
        next: { id: "newest" },
      });
    });

    it("returns nulls at ends or when missing", () => {
      expect(getChapterNeighbors(chapters, "newest").next).toBeNull();
      expect(getChapterNeighbors(chapters, "oldest").previous).toBeNull();
      expect(getChapterNeighbors(chapters, "missing")).toEqual({
        previous: null,
        next: null,
      });
    });
  });

  describe("buildChapterPageProxyPaths", () => {
    it("encodes slashy chapter ids with ~", () => {
      const paths = buildChapterPageProxyPaths("mangahere", "one_piece/100", 2);
      expect(paths).toEqual([
        "/api/chapters/mangahere/one_piece~100/pages/0",
        "/api/chapters/mangahere/one_piece~100/pages/1",
      ]);
    });
  });
});
