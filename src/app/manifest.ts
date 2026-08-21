import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Discover, Read & Track Manga`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    // Used as PWA splash / launch background on Android Chrome — keep dark to match app theme.
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "en",
    dir: "ltr",
    categories: ["books", "entertainment", "lifestyle"],
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
      },
      {
        name: "Search",
        short_name: "Search",
        url: "/search",
      },
      {
        name: "Settings",
        short_name: "Settings",
        url: "/settings",
      },
    ],
  };
}
