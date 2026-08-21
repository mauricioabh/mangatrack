import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { Viewport } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { AuthThemeProvider } from "@/components/auth-theme-provider";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { webApplicationJsonLd } from "@/lib/seo/json-ld";
import { rootLayoutMetadata } from "@/lib/seo/metadata";
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
  // Prefer dark chrome/splash; light only when the user explicitly prefers light.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-[#0f172a]" suppressHydrationWarning>
        <head>
          <JsonLd data={webApplicationJsonLd()} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-dvh overflow-x-hidden antialiased`}
        >
          <AuthThemeProvider>
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
