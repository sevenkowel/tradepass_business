import { test, expect } from "@playwright/test";

test.describe("KYC Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@tradepass.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/portal/);
  });

  test("user can navigate to KYC page", async ({ page }) => {
    await page.goto("/portal/kyc");
    await expect(page.locator("text=Identity Verification")).toBeVisible();
  });

  test("backoffice can access KYC review", async ({ page }) => {
    await page.goto("/backoffice/kyc/review");
    await expect(page.locator("text=KYC Review")).toBeVisible();
  });
});
