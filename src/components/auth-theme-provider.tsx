"use client";

import { ThemeProvider } from "@/components/theme-provider";

/** Theme wrapper — dark by default (matches Watchily; avoids light flash on PWA launch). */
export function AuthThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
