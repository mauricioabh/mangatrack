"use client";

import { useUser } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Public pages (logged out) always use light theme once Clerk has loaded.
 * While Clerk loads, respect stored theme so signed-in dark users (and PWA
 * relaunches) do not flash a white shell after the dark splash.
 */
export function AuthThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const forceLight = isLoaded && !isSignedIn;

  return (
    <ThemeProvider forcedTheme={forceLight ? "light" : undefined}>
      {children}
    </ThemeProvider>
  );
}
