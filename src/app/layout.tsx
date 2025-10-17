import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { MSWProvider } from "@/components/MSWProvider";
import GlobalHeader from "@/components/GlobalHeader";
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

export const metadata: Metadata = {
  title: "MangaTrack - Discover, Read & Track Manga",
  description:
    "A clean, minimalist web app for discovering, reading, and tracking manga with automated updates.",
  keywords: ["manga", "anime", "reading", "tracking", "otaku"],
  authors: [{ name: "MangaTrack Team" }],
  openGraph: {
    title: "MangaTrack - Discover, Read & Track Manga",
    description:
      "A clean, minimalist web app for discovering, reading, and tracking manga with automated updates.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MangaTrack - Discover, Read & Track Manga",
    description:
      "A clean, minimalist web app for discovering, reading, and tracking manga with automated updates.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider defaultTheme="system" storageKey="mangatrack-theme">
            <MSWProvider>
              <GlobalHeader />
              <div className="pt-16">{children}</div>
              <Toaster />
            </MSWProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
