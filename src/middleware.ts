import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/manga(.*)",
  "/reader(.*)",
  "/search(.*)",
  "/api/user(.*)",
  "/api/manga(.*)",
  "/api/chapters(.*)",
  "/api/catalog(.*)",
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
  if (isPublicApiRoute(req)) {
    return;
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
