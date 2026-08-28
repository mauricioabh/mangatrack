import { expect, type Page, type Response } from "@playwright/test";

/** Assert a matched API response is JSON (catches middleware/i18n regressions on /api/*). */
export function assertApiJsonResponse(
  response: Response,
  label?: string,
): void {
  const prefix = label ?? new URL(response.url()).pathname;
  const contentType = response.headers()["content-type"] ?? "";
  expect(contentType, `${prefix} content-type`).toContain("application/json");
  expect(response.status(), `${prefix} status`).toBeLessThan(400);
}

/** Wait for GET responses whose path includes one of the given fragments. */
export async function waitForApiJson(
  page: Page,
  pathFragments: string[],
): Promise<Response[]> {
  const pending = pathFragments.map((fragment) =>
    page.waitForResponse(
      (r) =>
        r.request().method() === "GET" &&
        r.url().includes(fragment) &&
        r.status() < 500,
      { timeout: 30000 },
    ),
  );
  return Promise.all(pending);
}
