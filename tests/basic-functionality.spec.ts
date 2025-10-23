import { test, expect } from "@playwright/test";

test.describe("Basic Functionality Tests", () => {
  test("server is running and accessible", async ({ page }) => {
    // Simple health check - just try to load the homepage
    await page.goto("/", { timeout: 30000 });
    await expect(page).toHaveTitle(/MangaTrack/);
  });

  test("homepage loads and shows sign in", async ({ page }) => {
    await page.goto("/", { timeout: 30000 });
    await expect(page).toHaveTitle(/MangaTrack/);
    await expect(page.locator("span:has-text('MangaTrack')")).toBeVisible();
    await expect(page.locator("text=Sign In")).toBeVisible();
  });

  test("dashboard redirects to sign in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard", { timeout: 30000 });
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    await expect(
      page.locator("[data-localization-key='signIn.start.title']")
    ).toBeVisible();
  });

  test("protected routes redirect to sign-in when not authenticated", async ({
    page,
  }) => {
    const protectedRoutes = ["/dashboard", "/settings"];

    for (const route of protectedRoutes) {
      await page.goto(route, { timeout: 30000 });
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(
        page.locator("[data-localization-key='signIn.start.title']")
      ).toBeVisible();
    }
  });
});
