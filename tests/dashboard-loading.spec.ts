import { test, expect } from "@playwright/test";
import { assertApiJsonResponse, waitForApiJson } from "./helpers/api-json";

test.describe("Dashboard Loading Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("dashboard loads and protected APIs return JSON", async ({ page }) => {
    const apiWaits = waitForApiJson(page, [
      "/api/user/profile",
      "/api/manga/bookmarks",
    ]);

    await page.goto("/dashboard", { timeout: 30000 });

    const [profileRes, bookmarksRes] = await apiWaits;
    assertApiJsonResponse(profileRes);
    assertApiJsonResponse(bookmarksRes);

    await expect(
      page.getByRole("heading", { name: "My Library", exact: true }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("dashboard shows library heading and empty state or bookmarks", async ({
    page,
  }) => {
    await page.goto("/dashboard", { timeout: 30000 });

    await expect(
      page.getByRole("heading", { name: "My Library", exact: true }),
    ).toBeVisible();

    const emptyTitle = page.getByText("Your library is empty");
    const searchPlaceholder = page.getByPlaceholder("Search your library…");

    await expect(emptyTitle.or(searchPlaceholder)).toBeVisible();
  });

  test("dashboard navigation to browse works", async ({ page }) => {
    await page.goto("/dashboard", { timeout: 30000 });

    await page.getByRole("link", { name: "Browse" }).click();
    await expect(page).toHaveURL(/\/browse/);

    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
