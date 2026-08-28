"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, type ReactNode } from "react";
import { env } from "@/env";

function initPostHog() {
  if (typeof window === "undefined") return;
  const key = env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthog.__loaded) return;

  posthog.init(key, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
  });
  posthog.register({ app: "man" });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (!pathname || !posthogClient) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    posthogClient.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthogClient]);

  return null;
}

function PostHogIdentify() {
  const { userId, isSignedIn } = useAuth();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (!posthogClient) return;
    if (isSignedIn && userId) {
      posthogClient.identify(userId);
    } else {
      posthogClient.reset();
    }
  }, [isSignedIn, userId, posthogClient]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}

export { usePostHog as useAnalytics };

export function captureEvent(
  name: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || typeof window === "undefined") return;
  posthog.capture(name, { ...properties, app: "man" });
}
