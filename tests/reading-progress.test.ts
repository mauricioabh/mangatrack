import {
  areAllChaptersRead,
  deriveLibraryProgress,
  getChapterToContinue,
  getContinueReadingLabel,
  sortChaptersByNumber,
} from "@/lib/reading-progress";

const chapters = [
  { id: "c3", chapterNumber: 3 },
  { id: "c1", chapterNumber: 1 },
  { id: "c2", chapterNumber: 2 },
];

describe("reading-progress", () => {
  it("sortChaptersByNumber orders ascending", () => {
    expect(sortChaptersByNumber(chapters).map((c) => c.chapterNumber)).toEqual([
      1, 2, 3,
    ]);
  });

  it("getChapterToContinue resumes lastReadChapterId mid-series", () => {
    const read = new Set(["c3"]);
    expect(getChapterToContinue(chapters, read, "c3")?.id).toBe("c3");
  });

  it("getChapterToContinue prefers more recent lastRead over earlier reads", () => {
    const read = new Set(["c1", "c2"]);
    expect(getChapterToContinue(chapters, read, "c2")?.id).toBe("c2");
  });

  it("getChapterToContinue returns first when all read", () => {
    const read = new Set(["c1", "c2", "c3"]);
    expect(getChapterToContinue(chapters, read, "c3")?.id).toBe("c1");
  });

  it("getChapterToContinue returns first when no history", () => {
    expect(getChapterToContinue(chapters, new Set())?.id).toBe("c1");
  });

  it("getChapterToContinue falls back to first when lastRead is orphan", () => {
    const read = new Set(["ghost"]);
    expect(getChapterToContinue(chapters, read, "ghost")?.id).toBe("c1");
  });

  it("getContinueReadingLabel reflects last session chapter", () => {
    expect(getContinueReadingLabel(chapters, new Set())).toBe("Start Reading");
    expect(getContinueReadingLabel(chapters, new Set(["c3"]), "c3")).toBe(
      "Continue Reading — Ch. 3",
    );
    expect(
      getContinueReadingLabel(chapters, new Set(["c1", "c2", "c3"]), "c3"),
    ).toBe("Re-read from start");
  });

  it("areAllChaptersRead", () => {
    expect(areAllChaptersRead(chapters, new Set(["c1"]))).toBe(false);
    expect(areAllChaptersRead(chapters, new Set(["c1", "c2", "c3"]))).toBe(
      true,
    );
  });
});

describe("deriveLibraryProgress", () => {
  it("no history → not reading, no bar when total unknown", () => {
    const p = deriveLibraryProgress({
      hasHistory: false,
      readChapterIds: new Set(),
      chapters: [],
    });
    expect(p.isReading).toBe(false);
    expect(p.progressRatio).toBeNull();
    expect(p.totalChapters).toBeNull();
  });

  it("unknown total omits progress bar even with history", () => {
    const p = deriveLibraryProgress({
      hasHistory: true,
      readChapterIds: new Set(["orphan-ch"]),
      chapters: [],
      totalChapters: null,
    });
    expect(p.isReading).toBe(true);
    expect(p.progressRatio).toBeNull();
    expect(p.readChapterCount).toBe(1);
  });

  it("partial progress uses latest read chapter / total", () => {
    const p = deriveLibraryProgress({
      hasHistory: true,
      readChapterIds: new Set(["c1", "c2"]),
      chapters,
    });
    expect(p.isReading).toBe(true);
    expect(p.latestReadChapterNumber).toBe(2);
    expect(p.totalChapters).toBe(3);
    expect(p.progressRatio).toBeCloseTo(2 / 3);
  });

  it("completed series clamps to 100%", () => {
    const p = deriveLibraryProgress({
      hasHistory: true,
      readChapterIds: new Set(["c1", "c2", "c3"]),
      chapters,
    });
    expect(p.progressRatio).toBe(1);
    expect(p.latestReadChapterNumber).toBe(3);
  });
});
