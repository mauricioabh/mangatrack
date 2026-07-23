import { buildChapterMulticastMessage } from "@/lib/push/fcm-multicast";

describe("buildChapterMulticastMessage", () => {
  it("builds data-only FCM (no notification block) for Android PWA", () => {
    const message = buildChapterMulticastMessage({
      tokens: ["token-a", "token-b"],
      title: "One Piece",
      body: "New chapter available: Chapter 1100",
      url: "https://mangatrack.wayool.com/reader/mangahere/one_piece~1100",
      provider: "mangahere",
      externalMangaId: "one_piece",
      externalChapterId: "one_piece/1100",
    });

    expect(message.tokens).toEqual(["token-a", "token-b"]);
    expect(message.notification).toBeUndefined();
    expect(message.data).toEqual({
      title: "One Piece",
      body: "New chapter available: Chapter 1100",
      url: "https://mangatrack.wayool.com/reader/mangahere/one_piece~1100",
      provider: "mangahere",
      externalMangaId: "one_piece",
      externalChapterId: "one_piece/1100",
    });
    expect(message.webpush?.headers?.Urgency).toBe("high");
    expect(message.webpush?.fcmOptions?.link).toBe(
      "https://mangatrack.wayool.com/reader/mangahere/one_piece~1100"
    );
    expect(message.android?.priority).toBe("high");
  });
});
