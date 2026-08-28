import {
  chapterApiPath,
  chapterPageProxyPath,
  decodeExternalId,
  encodeExternalId,
  mangaApiPath,
  mangaPath,
  readerPath,
} from "@/lib/consumet/ids";

describe("consumet ids", () => {
  it("encodeExternalId / decodeExternalId round-trip slashy ids", () => {
    const raw = "one_piece/100";
    const encoded = encodeExternalId(raw);
    expect(encoded).toBe("one_piece~100");
    expect(decodeExternalId(encoded)).toBe(raw);
  });

  it("decodeExternalId also URI-decodes", () => {
    expect(decodeExternalId("one_piece%2F100")).toBe("one_piece/100");
    expect(decodeExternalId("one_piece~100")).toBe("one_piece/100");
  });

  it("builds app and API paths with ~ for slashy manga and chapter ids", () => {
    expect(mangaPath("mangahere", "one_piece")).toBe(
      "/manga/mangahere/one_piece",
    );
    expect(mangaPath("mangapill", "3069/naruto")).toBe(
      "/manga/mangapill/3069~naruto",
    );
    expect(mangaApiPath("mangapill", "3069/naruto")).toBe(
      "/api/manga/mangapill/3069~naruto",
    );
    expect(readerPath("mangahere", "one_piece/1")).toBe(
      "/reader/mangahere/one_piece~1",
    );
    expect(
      readerPath("mangapill", "3069-1/naruto-chapter-1", "3069/naruto"),
    ).toBe("/reader/mangapill/3069-1~naruto-chapter-1?mangaId=3069%2Fnaruto");
    expect(chapterApiPath("mangapill", "a/b")).toBe(
      "/api/chapters/mangapill/a~b",
    );
    expect(chapterPageProxyPath("mangapill", "a/b", 3)).toBe(
      "/api/chapters/mangapill/a~b/pages/3",
    );
  });
});
