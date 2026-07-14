import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import type { Viewport } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { AuthThemeProvider } from "@/components/auth-theme-provider";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <JsonLd data={webApplicationJsonLd()} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased`}
        >
          <AuthThemeProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <ServiceWorkerRegister />
            <Toaster />
          </AuthThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
