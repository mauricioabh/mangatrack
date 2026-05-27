import {
  buildIncludedMap,
  mapMangaEntityToListItem,
} from "@/lib/mangadex/mappers";
import type {
  MangaDexEntity,
  MangaDexMangaAttributes,
} from "@/lib/mangadex/types";

describe("mangadex mappers", () => {
  it("maps manga entity to list item with localized title", () => {
    const entity: MangaDexEntity<MangaDexMangaAttributes> = {
      id: "32d76d19-8a05-4db0-9fc7-aec096849204",
      type: "manga",
      attributes: {
        title: { en: "One Piece" },
        description: { en: "A pirate adventure." },
        status: "ongoing",
        contentRating: "safe",
      },
      relationships: [
        {
          id: "cover-1",
          type: "cover_art",
          attributes: { fileName: "abc.jpg" },
        },
      ],
    };

    const included = buildIncludedMap([]);
    const item = mapMangaEntityToListItem(entity, included);

    expect(item.id).toBe(entity.id);
    expect(item.title).toBe("One Piece");
    expect(item.status).toBe("ONGOING");
    expect(item.coverImage).toContain("uploads.mangadex.org");
    expect(item.genres).toEqual([]);
  });
});
