"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { THEME_STORAGE_KEY } from "@/lib/theme-preference";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme from next-themes for convenience
export { useTheme } from "next-themes";
