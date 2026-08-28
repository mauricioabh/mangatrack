/** Default Referer headers scrape CDNs expect for covers / page images */
export const PROVIDER_REFERERS: Record<string, string> = {
  mangahere: "https://mangahere.cc/",
  mangapill: "https://mangapill.com/",
  mangadex: "https://mangadex.org/",
};

export function getProviderReferer(
  provider?: string | null,
): string | undefined {
  if (!provider) return undefined;
  return PROVIDER_REFERERS[provider.toLowerCase()];
}
