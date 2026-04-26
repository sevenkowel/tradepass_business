import { test, expect } from "@playwright/test";

test.describe("Portal Core Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@tradepass.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/portal/);
  });

  test("dashboard loads", async ({ page }) => {
    await page.goto("/portal");
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("trading terminal loads", async ({ page }) => {
    await page.goto("/portal/trading/terminal");
    await expect(page.locator("text=MT5 WebTerminal")).toBeVisible();
  });

  test("wallet page loads", async ({ page }) => {
    await page.goto("/portal/wallet");
    await expect(page.locator("text=Wallet")).toBeVisible();
  });
});
