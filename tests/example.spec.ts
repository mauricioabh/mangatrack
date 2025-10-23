import { test, expect } from "@playwright/test";

test.describe("Example Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MangaTrack/);
  });

  test("search page is accessible", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveTitle(/MangaTrack/);
  });
});
