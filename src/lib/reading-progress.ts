/** Chapter reference for reading progress (MangaDex chapter id + number). */
export type ChapterRef = {
  id: string;
  chapterNumber: number;
};

export type LibraryProgressInput = {
  /** True when the user has any reading_history row for this series */
  hasHistory: boolean;
  /** Chapter ids the user has read (may be empty even if hasHistory was derived elsewhere) */
  readChapterIds: ReadonlySet<string>;
  /** Consumet chapter list when available; used for max read number + total */
  chapters: ReadonlyArray<ChapterRef>;
  /** Override total when chapters list is empty but a count is known */
  totalChapters?: number | null;
};

export type LibraryProgress = {
  isReading: boolean;
  readChapterCount: number;
  latestReadChapterNumber: number | null;
  totalChapters: number | null;
  /** 0–1 when total is known and positive; otherwise null (omit bar) */
  progressRatio: number | null;
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

/**
 * Derive Library tile progress from history + Consumet chapter list.
 * No Prisma fields — safe to call from bookmarks API enrichment.
 */
export function deriveLibraryProgress(
  input: LibraryProgressInput
): LibraryProgress {
  const { hasHistory, readChapterIds, chapters } = input;
  const isReading = hasHistory || readChapterIds.size > 0;

  const readFromList = chapters.filter((c) => readChapterIds.has(c.id));
  const latestReadChapterNumber =
    readFromList.length > 0
      ? Math.max(...readFromList.map((c) => c.chapterNumber))
      : null;

  const readChapterCount =
    readFromList.length > 0 ? readFromList.length : readChapterIds.size;

  const listTotal = chapters.length > 0 ? chapters.length : null;
  const override =
    input.totalChapters != null &&
    Number.isFinite(input.totalChapters) &&
    input.totalChapters > 0
      ? Math.floor(input.totalChapters)
      : null;
  const totalChapters = listTotal ?? override;

  let progressRatio: number | null = null;
  if (totalChapters != null && totalChapters > 0) {
    const numerator =
      latestReadChapterNumber != null && latestReadChapterNumber > 0
        ? latestReadChapterNumber
        : readChapterCount;
    progressRatio = Math.min(1, Math.max(0, numerator / totalChapters));
  }

  return {
    isReading,
    readChapterCount,
    latestReadChapterNumber,
    totalChapters,
    progressRatio,
  };
}
