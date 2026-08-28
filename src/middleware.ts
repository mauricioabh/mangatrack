import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isApiRoute(req: NextRequest): boolean {
  const pathname = req.nextUrl.pathname;
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/trpc" ||
    pathname.startsWith("/trpc/")
  );
}

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

  // API handlers own their authentication so unauthenticated requests can
  // return JSON instead of Clerk's browser redirect/HTML handshake.
  if (isApi) {
    return NextResponse.next();
  }

  if (isPublicApiRoute(req)) {
    return intlMiddleware(req);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next|api).*)", "/", "/(api|trpc)(.*)"],
};
