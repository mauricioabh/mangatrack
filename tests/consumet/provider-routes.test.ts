import {
  consumetInfoPath,
  consumetReadPath,
  normalizeCoverUrl,
  rewriteMangaDexCoverUrl,
  usesPathStyleInfo,
  usesPathStyleRead,
} from "@/lib/consumet/provider-routes";

describe("provider-routes", () => {
  it("uses path-style info/read only for mangadex", () => {
    expect(usesPathStyleInfo("mangadex")).toBe(true);
    expect(usesPathStyleRead("mangadex")).toBe(true);
    expect(usesPathStyleInfo("mangapill")).toBe(false);
    expect(usesPathStyleRead("mangahere")).toBe(false);
  });

  it("builds mangadex path-style endpoints", () => {
    const id = "a1b2c3d4-e5f6-4711-8abc-1234567890ab";
    expect(consumetInfoPath("mangadex", id)).toBe(
      `/manga/mangadex/info/${encodeURIComponent(id)}`
    );
    expect(consumetReadPath("mangadex", id)).toBe(
      `/manga/mangadex/read/${encodeURIComponent(id)}`
    );
  });

  it("keeps query-style base paths for scrapers", () => {
    expect(consumetInfoPath("mangahere", "one_piece")).toBe(
      "/manga/mangahere/info"
    );
    expect(consumetReadPath("mangapill", "3069/ch")).toBe(
      "/manga/mangapill/read"
    );
  });

  it("rewrites mangadex.org covers to uploads .256.jpg", () => {
    const src =
      "https://mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/2f4aca53-64c7-46ac-ae85-3bc9b3169890.png";
    expect(rewriteMangaDexCoverUrl(src)).toBe(
      "https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/2f4aca53-64c7-46ac-ae85-3bc9b3169890.png.256.jpg"
    );
    expect(normalizeCoverUrl("mangadex", src)).toContain("uploads.mangadex.org");
    expect(
      normalizeCoverUrl("mangahere", "http://fmcdn.mangahere.com/cover.jpg")
    ).toBe("http://fmcdn.mangahere.com/cover.jpg");
  });
});
