import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploads.mangadex.org",
        port: "",
        pathname: "/covers/**",
      },
      {
        protocol: "https",
        hostname: "**.mangadex.network",
        port: "",
        pathname: "/data/**",
      },
      {
        protocol: "https",
        hostname: "**.mangadex.network",
        port: "",
        pathname: "/data-saver/**",
      },
      {
        protocol: "http",
        hostname: "fmcdn.mangahere.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fmcdn.mangahere.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.mangahere.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.mangapill.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.mangapill.com",
        port: "",
        pathname: "/**",
      },
      // MangaPill / scrape providers often serve covers from title-specific CDNs
      {
        protocol: "https",
        hostname: "cdn.readdetectiveconan.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.readdetectiveconan.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.mangapill.me",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zjcdn.mangahere.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT ?? "mangatrack",
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
