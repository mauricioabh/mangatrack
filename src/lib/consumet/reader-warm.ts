import { chapterApiPath } from "./ids";

/**
 * Start Consumet page-list resolution (and first scan decode) before the
 * reader route mounts — call on chapter link pointerdown / continue click.
 */
export function warmChapterPages(
  provider: string,
  chapterId: string,
  mangaId?: string,
): void {
  void fetch(chapterApiPath(provider, chapterId, mangaId, "pages"))
    .then((res) => res.json())
    .then((data: { success?: boolean; chapter?: { pages?: string[] } }) => {
      const first = data.chapter?.pages?.[0];
      if (!data.success || !first || typeof window === "undefined") return;
      const img = new Image();
      img.decoding = "async";
      img.src = first;
    })
    .catch(() => {
      // best-effort warm
    });
}
