import { expect, test } from "@playwright/test";

/**
 * Smoke tests against a running dev/prod server (npm run dev / npm start).
 * They only exercise public pages so no database seed state is required.
 */
test.describe("public site", () => {
  test("home page renders hero and primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Reliable Home Services/i);
    await expect(page.getByRole("link", { name: /request/i }).first()).toBeVisible();
  });

  test("services index lists core services", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: /plumbing/i }).first()).toBeVisible();
  });

  test("lead form validates before submit", async ({ page }) => {
    await page.goto("/request-service");
    const next = page.getByRole("button", { name: /next|continue/i });
    if (await next.isVisible()) {
      // Multi-step form should not advance without choosing required fields.
      await next.click();
      await expect(page.locator("[role=alert], .text-red-600").first()).toBeVisible();
    }
  });

  test("admin area is protected", async ({ page }) => {
    await page.goto("/admin");
    expect(new URL(page.url()).pathname).toBe("/admin/login");
  });
});
