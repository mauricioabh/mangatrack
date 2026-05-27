import {
  areAllChaptersRead,
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
