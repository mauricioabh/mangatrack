import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "mangatrack",
});

export type ChapterPublishedEventData = {
  manga_id: string;
  chapter: Record<string, unknown>;
  translatedLanguage: string;
};
