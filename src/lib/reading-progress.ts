/** Chapter reference for reading progress (MangaDex chapter id + number). */
export type ChapterRef = {
  id: string;
  chapterNumber: number;
};

export function sortChaptersByNumber<T extends { chapterNumber: number }>(
  chapters: T[]
): T[] {
  return [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
}

/** First unread chapter in order; if all read, returns the first chapter (re-read). */
export function getChapterToRead<T extends ChapterRef>(
  chapters: T[],
  readChapterIds: ReadonlySet<string>
): T | undefined {
  const sorted = sortChaptersByNumber(chapters);
  if (sorted.length === 0) return undefined;
  return sorted.find((c) => !readChapterIds.has(c.id)) ?? sorted[0];
}

export function hasReadingProgress(
  readChapterIds: ReadonlySet<string>
): boolean {
  return readChapterIds.size > 0;
}

export function areAllChaptersRead(
  chapters: ChapterRef[],
  readChapterIds: ReadonlySet<string>
): boolean {
  return (
    chapters.length > 0 && chapters.every((c) => readChapterIds.has(c.id))
  );
}

export function getContinueReadingLabel(
  chapters: ChapterRef[],
  readChapterIds: ReadonlySet<string>
): string {
  if (!hasReadingProgress(readChapterIds)) {
    return "Start Reading";
  }
  if (areAllChaptersRead(chapters, readChapterIds)) {
    return "Re-read from start";
  }
  const next = getChapterToRead(chapters, readChapterIds);
  if (next) {
    return `Continue Reading — Ch. ${next.chapterNumber}`;
  }
  return "Continue Reading";
}
