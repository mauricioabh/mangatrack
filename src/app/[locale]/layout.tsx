import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { AuthThemeProvider } from "@/components/auth-theme-provider";
import { ThemeCookieSync } from "@/components/theme-cookie-sync";
import { ThemeScript } from "@/components/theme-script";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { webApplicationJsonLd } from "@/lib/seo/json-ld";
import {
  resolveAppTheme,
  themeClassName,
  THEME_COOKIE_NAME,
} from "@/lib/theme-preference";
import { routing } from "@/i18n/routing";
import "../globals.css";
import "../animations.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const cookieStore = await cookies();
  const savedTheme = resolveAppTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return (
    <html
      lang={locale}
      className={`${themeClassName(savedTheme)} bg-[#0f172a]`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <ThemeScript />
        <JsonLd data={webApplicationJsonLd()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh overflow-x-hidden antialiased`}
      >
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <PostHogProvider>
                <NuqsAdapter>
                  <AuthThemeProvider>
                    <ThemeCookieSync />
                    <ConditionalLayout>{children}</ConditionalLayout>
                    <ServiceWorkerRegister />
                    <PwaInstallPrompt />
                    <Toaster />
                  </AuthThemeProvider>
                </NuqsAdapter>
              </PostHogProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
