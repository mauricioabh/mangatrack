/**
 * Client-only stale-first cache for Library bookmarks hydration.
 * sessionStorage so a full remount of DashboardContent can still paint instantly.
 */

export const LIBRARY_FOCUS_THROTTLE_MS = 90_000;
export const LIBRARY_CACHE_MAX_AGE_MS = 10 * 60_000;

const ENTRY_PREFIX = "mangatrack:library-bookmarks:v1:";
const LAST_USER_KEY = "mangatrack:library-cache-user-v1";

export interface LibraryCacheUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar: string;
  tier: string;
}

export interface LibraryCacheEntry<TBookmark = unknown> {
  fetchedAt: number;
  user: LibraryCacheUser;
  bookmarks: TBookmark[];
}

function entryKey(userId: string): string {
  return `${ENTRY_PREFIX}${userId}`;
}

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function getLastLibraryCacheUserId(): string | null {
  if (!canUseSessionStorage()) return null;
  try {
    return sessionStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}

export function readLibraryCache<TBookmark = unknown>(
  userId: string,
): LibraryCacheEntry<TBookmark> | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(entryKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LibraryCacheEntry<TBookmark>;
    if (
      !parsed ||
      typeof parsed.fetchedAt !== "number" ||
      !parsed.user?.id ||
      !Array.isArray(parsed.bookmarks)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isLibraryCacheFresh(
  fetchedAt: number,
  maxAgeMs: number = LIBRARY_CACHE_MAX_AGE_MS,
): boolean {
  return Date.now() - fetchedAt < maxAgeMs;
}

export function writeLibraryCache<TBookmark>(
  user: LibraryCacheUser,
  bookmarks: TBookmark[],
): void {
  if (!canUseSessionStorage()) return;
  const entry: LibraryCacheEntry<TBookmark> = {
    fetchedAt: Date.now(),
    user,
    bookmarks,
  };
  try {
    sessionStorage.setItem(entryKey(user.id), JSON.stringify(entry));
    sessionStorage.setItem(LAST_USER_KEY, user.id);
  } catch (error) {
    console.error("Error writing library cache:", error);
  }
}

export function invalidateLibraryCache(): void {
  if (!canUseSessionStorage()) return;
  try {
    const userId = sessionStorage.getItem(LAST_USER_KEY);
    if (userId) {
      sessionStorage.removeItem(entryKey(userId));
    }
    sessionStorage.removeItem(LAST_USER_KEY);
    // Best-effort sweep of any leftover prefixed keys
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(ENTRY_PREFIX)) toRemove.push(key);
    }
    for (const key of toRemove) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Error invalidating library cache:", error);
  }
}

export function shouldRefreshLibraryOnFocus(fetchedAt: number | null): boolean {
  if (fetchedAt == null) return true;
  return Date.now() - fetchedAt >= LIBRARY_FOCUS_THROTTLE_MS;
}
