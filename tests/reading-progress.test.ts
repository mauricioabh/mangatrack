import {
  areAllChaptersRead,
  deriveLibraryProgress,
  getChapterToRead,
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

  it("getChapterToRead returns first unread", () => {
    const read = new Set(["c1"]);
    expect(getChapterToRead(chapters, read)?.id).toBe("c2");
  });

  it("getChapterToRead skips gaps in chapter numbers", () => {
    const withGap = [
      { id: "a", chapterNumber: 1 },
      { id: "b", chapterNumber: 5 },
    ];
    const read = new Set(["a"]);
    expect(getChapterToRead(withGap, read)?.id).toBe("b");
  });

  it("getChapterToRead returns first when all read", () => {
    const read = new Set(["c1", "c2", "c3"]);
    expect(getChapterToRead(chapters, read)?.id).toBe("c1");
  });

  it("getContinueReadingLabel reflects progress", () => {
    expect(getContinueReadingLabel(chapters, new Set())).toBe("Start Reading");
    expect(getContinueReadingLabel(chapters, new Set(["c1"]))).toBe(
      "Continue Reading — Ch. 2"
    );
    expect(
      getContinueReadingLabel(chapters, new Set(["c1", "c2", "c3"]))
    ).toBe("Re-read from start");
  });

  it("areAllChaptersRead", () => {
    expect(areAllChaptersRead(chapters, new Set(["c1"]))).toBe(false);
    expect(areAllChaptersRead(chapters, new Set(["c1", "c2", "c3"]))).toBe(
      true
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
