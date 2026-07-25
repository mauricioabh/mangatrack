import {
  browseCardHref,
  isMangaDexUuid,
  periodSinceIso,
} from "@/lib/browse";

describe("browse helpers", () => {
  it("isMangaDexUuid accepts valid UUIDs", () => {
    expect(
      isMangaDexUuid("a1b2c3d4-e5f6-4711-8abc-1234567890ab")
    ).toBe(true);
    expect(isMangaDexUuid("not-a-uuid")).toBe(false);
  });

  it("browseCardHref prefers mangadex detail for UUID", () => {
    const id = "a1b2c3d4-e5f6-4711-8abc-1234567890ab";
    expect(browseCardHref(id, "One Piece")).toBe(`/manga/mangadex/${id}`);
  });

  it("browseCardHref falls back to search by title", () => {
    expect(browseCardHref("slug-id", "Demon Slayer")).toBe(
      `/search?q=${encodeURIComponent("Demon Slayer")}`
    );
  });

  it("periodSinceIso returns ISO without millis for each window", () => {
    const now = new Date("2026-07-24T18:00:00.000Z");
    expect(periodSinceIso("today", now)).toBe("2026-07-23T18:00:00");
    expect(periodSinceIso("week", now)).toBe("2026-07-17T18:00:00");
    expect(periodSinceIso("month", now)).toBe("2026-06-24T18:00:00");
  });
});
