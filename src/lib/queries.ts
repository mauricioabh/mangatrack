import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { parseJsonResponse } from "@/lib/fetch-json";
import type { LibrarySort } from "@/lib/validations";

export const profileQueryKey = ["user", "profile"] as const;
export const preferencesQueryKey = ["user", "preferences"] as const;
export const bookmarksQueryKey = ["manga", "bookmarks"] as const;

export interface ProfileUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar: string;
  tier: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  libraryFilterNew: boolean;
  libraryFilterReading: boolean;
  libraryFilterFinished: boolean;
  librarySort: LibrarySort;
}

export function invalidateLibraryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: bookmarksQueryKey });
}

export function profileQueryOptions() {
  return queryOptions({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      const json = await parseJsonResponse<{
        success?: boolean;
        error?: string;
        user?: ProfileUser;
      }>(res);
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load profile");
      }
      return json.user as ProfileUser;
    },
  });
}

export function preferencesQueryOptions() {
  return queryOptions({
    queryKey: preferencesQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/user/preferences");
      const json = await parseJsonResponse<{
        success?: boolean;
        error?: string;
        preferences?: UserPreferences;
      }>(res);
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load preferences");
      }
      return json.preferences as UserPreferences;
    },
  });
}
export function bookmarksQueryOptions() {
  return queryOptions({
    queryKey: bookmarksQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/manga/bookmarks");
      const json = await parseJsonResponse<{
        success?: boolean;
        error?: string;
        data?: unknown[];
      }>(res);
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load bookmarks");
      }
      return json.data as unknown[];
    },
  });
}

export function browseQueryOptions(mode: string, period: string) {
  return queryOptions({
    queryKey: ["browse", mode, period],
    queryFn: async () => {
      const params = new URLSearchParams({ mode, period });
      const res = await fetch(`/api/browse?${params.toString()}`);
      const json = await parseJsonResponse<{
        success?: boolean;
        error?: string;
        data?: { items?: unknown[] };
      }>(res);
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load feed");
      }
      return json.data?.items ?? [];
    },
  });
}
