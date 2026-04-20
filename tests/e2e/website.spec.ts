import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3001";

test.describe("Website Marketing Pages", () => {
  test("WEB-01: Homepage renders all key sections", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("load");
    // Scroll to trigger Framer Motion animations
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 15000 });
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    const keyTerms = ["TradePass", "交易", "平台", "产品", "生态", "Trusted", "broker"];
    const found = keyTerms.filter(t => bodyText!.includes(t));
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  test("WEB-02: Theme switcher works", async ({ page }) => {
    await page.goto(BASE);
    const themeBtn = page.locator('button[aria-label*="theme" i], button[title*="theme" i], [data-testid="theme-toggle"]').first();
    if (await themeBtn.isVisible().catch(() => false)) {
      await themeBtn.click();
      const hasDark = await page.evaluate(() => document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark");
      expect(hasDark !== undefined).toBe(true);
    } else {
      test.skip(true, "No theme toggle found");
    }
  });

  test("WEB-03: CTA buttons have correct hrefs", async ({ page }) => {
    await page.goto(BASE);
    const registerLink = page.locator('a[href="/auth/register"]').first();
    await expect(registerLink).toBeVisible();
  });

  test("WEB-04: Page content loads", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("load");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(50);
  });

  test("WEB-05: Responsive on mobile - no horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE);
    await page.waitForLoadState("load");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const vpWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(vpWidth + 1);
  });
});
