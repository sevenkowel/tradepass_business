import { Page, expect } from "@playwright/test";

export const TEST_USER = {
  email: `test-${Date.now()}@e2e.local`,
  password: "TestPass123!",
  name: "E2E Tester",
};

export async function registerAndLogin(
  page: Page,
  opts: { skipVerify?: boolean } = {}
) {
  const { skipVerify = true } = opts;
  await page.goto("/auth/register");
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.fill('input[name="name"]', TEST_USER.name);

  if (skipVerify) {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
    }
  }

  await page.click('button[type="submit"]');
  await page.waitForURL(/\/console|\/portal\/dashboard/, { timeout: 15000 });
}

export async function loginWithTestUser(page: Page) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/console|\/portal/, { timeout: 15000 });
}

export async function logout(page: Page) {
  await page.goto("/api/auth/logout");
}
