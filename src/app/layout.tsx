import type { Viewport } from "next";
import { rootLayoutMetadata } from "@/lib/seo/metadata";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
