import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // Environment variables are loaded from .env.test file
  console.log("🔧 Global setup: Test environment loaded");
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   PLAYWRIGHT_TEST: ${process.env.PLAYWRIGHT_TEST}`);
}

export default globalSetup;
