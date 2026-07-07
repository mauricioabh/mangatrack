/** Public routes included in sitemap.xml (stable, no sensitive query state). */
export const PUBLIC_SITEMAP_PATHS = ["/"] as const;

export type PublicSitemapPath = (typeof PUBLIC_SITEMAP_PATHS)[number];
