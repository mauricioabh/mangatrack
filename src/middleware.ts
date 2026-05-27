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
  "/api/notifications(.*)",
  "/api/simulate-email(.*)",
  "/api/stripe(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/webhook(.*)",
  "/api/inngest(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicApiRoute(req)) {
    return;
  }
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  // Protects all routes including api/trpc routes
  // Please edit this to allow other routes to be public as needed.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
