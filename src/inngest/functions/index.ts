import { chapterPublishedPush } from "@/inngest/functions/chapter-published";
import { pollFavoriteChapters } from "@/inngest/functions/poll-favorite-chapters";

export const inngestFunctions = [chapterPublishedPush, pollFavoriteChapters];
