import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { Viewport } from "next";
import { cookies } from "next/headers";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { AuthThemeProvider } from "@/components/auth-theme-provider";
import { ThemeCookieSync } from "@/components/theme-cookie-sync";
import { ThemeScript } from "@/components/theme-script";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { webApplicationJsonLd } from "@/lib/seo/json-ld";
import { rootLayoutMetadata } from "@/lib/seo/metadata";
import {
  resolveAppTheme,
  themeClassName,
  THEME_COOKIE_NAME,
} from "@/lib/theme-preference";
import "./globals.css";
import "./animations.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Clerk + env-dependent UI: avoid static prerender with placeholder keys at build time. */
export const dynamic = "force-dynamic";

export const metadata = rootLayoutMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedTheme = resolveAppTheme(
    cookieStore.get(THEME_COOKIE_NAME)?.value,
  );

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${themeClassName(savedTheme)} bg-[#0f172a]`}
        suppressHydrationWarning
      >
        <head>
          {/*
           * Next 15 streams `metadata` into <body>, where Chrome ignores the
           * manifest link (installability error `no-manifest`) and the PWA is
           * installed as a plain shortcut with the default light splash.
           * Rendering it here guarantees it lands in <head>.
           */}
          <link rel="manifest" href="/manifest.webmanifest" />
          <ThemeScript />
          <JsonLd data={webApplicationJsonLd()} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-dvh overflow-x-hidden antialiased`}
        >
          <AuthThemeProvider>
            <ThemeCookieSync />
            <ConditionalLayout>{children}</ConditionalLayout>
            <ServiceWorkerRegister />
            <PwaInstallPrompt />
            <Toaster />
          </AuthThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
