import { test, expect } from "@playwright/test";

test.describe("Dashboard Loading Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("dashboard loads with user data", async ({ page }) => {
    await page.goto("/dashboard", { timeout: 30000 });

    // Check dashboard elements are visible
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator("text=Total Bookmarks")).toBeVisible();
    await expect(page.locator("text=Recent Bookmarks")).toBeVisible();
  });

  test("dashboard shows empty state when no bookmarks", async ({ page }) => {
    await page.goto("/dashboard", { timeout: 30000 });

    // Check empty state elements
    await expect(page.locator("text=No bookmarks yet")).toBeVisible();
    await expect(page.locator("text=Discover Manga")).toBeVisible();
  });

  test("dashboard navigation works", async ({ page }) => {
    await page.goto("/dashboard", { timeout: 30000 });

    // Test navigation to search page
    await page.click("text=Discover Manga");
    await expect(page).toHaveURL(/\/search/);

    // Go back to dashboard
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
