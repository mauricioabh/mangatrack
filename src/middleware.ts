import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/manga(.*)",
  "/reader(.*)",
  "/search(.*)",
  "/browse(.*)",
  "/:locale/dashboard(.*)",
  "/:locale/settings(.*)",
  "/:locale/manga(.*)",
  "/:locale/reader(.*)",
  "/:locale/search(.*)",
  "/:locale/browse(.*)",
  "/api/user(.*)",
  "/api/manga(.*)",
  "/api/chapters(.*)",
  "/api/catalog(.*)",
  "/api/browse(.*)",
  "/api/notifications(.*)",
  "/api/simulate-email(.*)",
  "/api/stripe(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/webhook(.*)",
  "/api/webhooks(.*)",
  "/api/inngest(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const isApi = isApiRoute(req);

  if (isPublicApiRoute(req)) {
    return isApi ? NextResponse.next() : intlMiddleware(req);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // API routes must not pass through next-intl (would 404 + HTML error pages)
  if (isApi) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api).*)", "/", "/(api|trpc)(.*)"],
};
