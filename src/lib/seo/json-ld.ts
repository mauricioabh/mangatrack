import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";

export function webApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    description: DEFAULT_DESCRIPTION,
    url: getSiteUrl(),
    inLanguage: "en-US",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
