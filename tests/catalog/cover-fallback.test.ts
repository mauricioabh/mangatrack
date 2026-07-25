import {
  fetchAniListCoverByTitle,
  isCloudflareBlockedCoverHost,
} from "@/lib/catalog/cover-fallback";

describe("cover-fallback", () => {
  it("detects ComicK CDN hosts", () => {
    expect(isCloudflareBlockedCoverHost("cdn1.comicknew.pictures")).toBe(true);
    expect(isCloudflareBlockedCoverHost("cdn2.comicknew.pictures")).toBe(true);
    expect(isCloudflareBlockedCoverHost("meo.comick.pictures")).toBe(true);
    expect(isCloudflareBlockedCoverHost("uploads.mangadex.org")).toBe(false);
  });

  it("fetches an AniList cover for a well-known title", async () => {
    const url = await fetchAniListCoverByTitle("One Piece");
    expect(url).toBeTruthy();
    expect(url).toMatch(/^https:\/\//);
  }, 20_000);
});
