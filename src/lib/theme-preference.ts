export const THEME_STORAGE_KEY = "mangatrack-theme-v2";
export const THEME_COOKIE_NAME = "mangatrack-theme";

export type AppTheme = "light" | "dark";

export function resolveAppTheme(value: string | null | undefined): AppTheme {
  return value === "light" ? "light" : "dark";
}

/** Persist theme for SSR (cookie) so the first paint matches saved preference. */
export function persistThemeCookie(theme: AppTheme): void {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

export function themeClassName(theme: AppTheme): string {
  return theme === "light" ? "light" : "dark";
}
