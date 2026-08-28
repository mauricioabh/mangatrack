import { test, expect } from "@playwright/test";

test.describe("Internationalization", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("language switcher in settings changes locale and translated UI", async ({
    page,
  }) => {
    await page.goto("/settings", { timeout: 30000 });

    await page.getByRole("tab", { name: "Preferences" }).click();
    await expect(page.getByRole("heading", { name: "Language" })).toBeVisible();

    const languageSection = page
      .locator("section")
      .filter({ hasText: "Choose your preferred language" });

    await languageSection.getByRole("combobox").click();
    await page.getByRole("option", { name: "Español" }).click();

    await expect(page).toHaveURL(/\/es\/settings/);
    await page.getByRole("tab", { name: "Preferencias" }).click();
    await expect(page.getByRole("heading", { name: "Idioma" })).toBeVisible();

    await page.goto("/es/dashboard", { timeout: 30000 });
    await expect(
      page.getByRole("heading", { name: "Mi biblioteca", exact: true }),
    ).toBeVisible();

    await page.goto("/es/settings");
    await page.getByRole("tab", { name: "Preferencias" }).click();
    const esLanguageSection = page
      .locator("section")
      .filter({ hasText: "Elige el idioma" });
    await esLanguageSection.getByRole("combobox").click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: "Language" })).toBeVisible();
  });

  test("Spanish dashboard URL loads with translated heading", async ({
    page,
  }) => {
    await page.goto("/es/dashboard", { timeout: 30000 });
    await expect(
      page.getByRole("heading", { name: "Mi biblioteca", exact: true }),
    ).toBeVisible({ timeout: 15000 });
  });
});
