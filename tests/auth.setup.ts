import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  setup.setTimeout(120000); // 2 minutes for auth setup
  console.log("🚀 Starting authentication setup...");

  // Go to sign-in page
  await page.goto("/sign-in", { timeout: 30000 });
  console.log("📄 Navigated to sign-in page");
  console.log("📄 Current URL:", page.url());

  // Removed networkidle wait - it was causing timeouts due to continuous network activity
  console.log("🌐 Page should be loaded");

  // Wait for the page to fully load
  await page.waitForTimeout(3000);
  console.log("⏰ Additional wait completed");

  // Check for any console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("🚨 Browser console error:", msg.text());
    }
  });

  // Check for any network failures
  page.on("response", (response) => {
    if (!response.ok()) {
      console.log("🚨 Network error:", response.url(), response.status());
    }
  });

  // Define test user credentials from environment variables
  const testUser = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testUser || !testPassword) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required for testing"
    );
  }

  // Use email/password authentication for test user
  console.log("🔍 Using email/password authentication for test user...");

  // Look for "Use email instead" or similar option to switch to email/password
  const useEmailOption = page
    .locator(
      'text="Use email instead", text="Email", text="Sign in with email"'
    )
    .first();
  if (await useEmailOption.isVisible()) {
    console.log("🔍 Found email/password option, clicking it...");
    await useEmailOption.click();
    await page.waitForTimeout(1000);
  }

  // Look for email/password fields (not OAuth)
  console.log("🔍 Looking for email input field...");
  console.log("📄 Current URL:", page.url());
  console.log("📄 Page title:", await page.title());

  // Take a screenshot for debugging
  await page.screenshot({ path: "debug-auth-page.png" });

  await page.waitForSelector('input[type="email"], input[name="identifier"]', {
    timeout: 15000,
  });

  // Fill in real test user credentials
  await page.fill('input[name="identifier"], input[type="email"]', testUser);
  await page.fill(
    'input[name="password"], input[type="password"]',
    testPassword
  );

  // Submit the form - click the Continue button (the one with arrow, not Google)
  // Look for button that contains "Continue" but is not the Google OAuth button
  await page.waitForSelector('button:has-text("Continue")', { timeout: 10000 });

  // Get all Continue buttons and click the one that's not for Google OAuth
  const continueButtons = page.locator('button:has-text("Continue")');
  const buttonCount = await continueButtons.count();

  for (let i = 0; i < buttonCount; i++) {
    const button = continueButtons.nth(i);
    const buttonText = await button.textContent();
    if (
      buttonText &&
      buttonText.includes("Continue") &&
      !buttonText.includes("Google")
    ) {
      await button.click();
      break;
    }
  }

  // Wait for any redirect after sign-in (could be factor-one or dashboard)
  await page.waitForLoadState("networkidle", { timeout: 10000 });

  // Check if we're on factor-one page and handle it
  const currentUrl = page.url();
  if (currentUrl.includes("/sign-in/factor-one")) {
    console.log("🔐 Detected factor-one page, waiting for completion...");
    // Wait for the factor-one process to complete and redirect
    await page.waitForURL("/dashboard", { timeout: 20000 });
  } else {
    // Direct redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 30000 });
  }

  // Wait for loading to complete - look for the actual content, not skeleton
  await page.waitForSelector('h1:has-text("Welcome Back")', { timeout: 15000 });

  // Verify we're on the dashboard (with longer timeout)
  await expect(page.locator('h1:has-text("Welcome Back")')).toBeVisible({
    timeout: 10000,
  });

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
