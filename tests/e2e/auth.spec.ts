import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can register and verify email", async ({ page }) => {
    await page.goto("/auth/register");
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="name"]', "Test User");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/verify-email/);
  });

  test("user can login with valid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@tradepass.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/portal/);
  });

  test("login fails with invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });
});
