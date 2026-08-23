"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { persistThemeCookie, type AppTheme } from "@/lib/theme-preference";

/** Keeps theme cookie in sync with next-themes (localStorage) for SSR on next launch. */
export function ThemeCookieSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const active = theme === "system" ? resolvedTheme : theme;
    if (active === "light" || active === "dark") {
      persistThemeCookie(active as AppTheme);
    }
  }, [theme, resolvedTheme]);

  return null;
}
