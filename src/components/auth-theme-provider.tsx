"use client";

import { useUser } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Public pages (logged out) always use light theme.
 * Signed-in app areas use the theme from Settings (localStorage).
 */
export function AuthThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  // Light while Clerk loads and on all public (logged-out) pages — avoids dark flash from localStorage.
  const forceLight = !isLoaded || !isSignedIn;

  return (
    <ThemeProvider forcedTheme={forceLight ? "light" : undefined}>
      {children}
    </ThemeProvider>
  );
}
