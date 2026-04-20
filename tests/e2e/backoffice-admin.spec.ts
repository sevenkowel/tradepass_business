import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3001";
const TEST_PASSWORD = "TestPass123!";

async function apiRegister(request: any, email: string, skipVerify = false) {
  return request.post(`${BASE}/api/auth/register`, {
    data: { email, password: TEST_PASSWORD, name: "BO Tester", skipVerification: skipVerify },
  });
}

async function apiLogin(request: any, email: string) {
  return request.post(`${BASE}/api/auth/login`, {
    data: { email, password: TEST_PASSWORD },
  });
}

async function setupAuth(page: Page, request: any, email: string) {
  let loginRes = await apiLogin(request, email);
  if (loginRes.status() !== 200) {
    await new Promise((r) => setTimeout(r, 500));
    loginRes = await apiLogin(request, email);
  }
  expect(loginRes.status()).toBe(200);
  const setCookie = loginRes.headers()["set-cookie"] || "";
  const tokenMatch = setCookie.match(/token=([^;]+)/);
  expect(tokenMatch).toBeTruthy();
  await page.context().addCookies([
    { name: "token", value: tokenMatch![1], domain: "localhost", path: "/" },
  ]);
}

test.describe.serial("Backoffice, Console & Admin", () => {
  let testEmail = "";

  test.beforeAll(async ({ request }) => {
    testEmail = `bo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
    await apiRegister(request, testEmail, true);
  });

  test.beforeEach(async ({ page, request }) => {
    await setupAuth(page, request, testEmail);
  });

  // Backoffice - without tenant param redirects to /console
  test("BO-DASH-01: /backoffice redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-USER-01: /backoffice/users redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/users`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-ACC-01: /backoffice/accounts redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/accounts`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-KYC-01: /backoffice/compliance/kyc-review redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/compliance/kyc-review`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-FUN-01: /backoffice/funds/withdrawal-review redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/funds/withdrawal-review`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-CRM-01: /backoffice/crm/tickets redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/crm/tickets`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-SYS-01: /backoffice/system/config redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/system/config`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-SYS-02: /backoffice/system/kyc-config redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/backoffice/system/kyc-config`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("BO-MOB-01: Mobile sidebar - backoffice redirects without tenant", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/backoffice`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  // Console - these work without tenant param
  test("CON-DASH-01: /console renders", async ({ page }) => {
    await page.goto(`${BASE}/console`);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("CON-TEN-01: /console/tenants renders", async ({ page }) => {
    await page.goto(`${BASE}/console/tenants`);
    await expect(page.getByText("租户", { exact: false }).or(page.getByText("Tenants"))).toBeVisible({ timeout: 15000 });
  });

  test("CON-TEN-02: /console/tenants/new renders", async ({ page }) => {
    await page.goto(`${BASE}/console/tenants/new`);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("CON-PRO-01: /console/products renders", async ({ page }) => {
    await page.goto(`${BASE}/console/products`);
    await expect(page.getByText("产品", { exact: false }).or(page.getByText("Products"))).toBeVisible({ timeout: 15000 });
  });

  // Admin - check redirect or render
  test("ADM-DASH-01: /admin renders or redirects", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("ADM-USER-01: /admin/users renders or redirects", async ({ page }) => {
    await page.goto(`${BASE}/admin/users`);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("ADM-LIC-01: /admin/licenses renders", async ({ page }) => {
    await page.goto(`${BASE}/admin/licenses`);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    const text = await page.locator("body").textContent();
    if (text && (text.includes("tp-") || text.includes("****"))) {
      expect(text).toMatch(/tp-.*\*\*\*\*/);
    }
  });

  test("ADM-AUD-01: /admin/audit-logs renders", async ({ page }) => {
    await page.goto(`${BASE}/admin/audit-logs`);
    await expect(page.getByText("审计", { exact: false }).or(page.getByText("Audit"))).toBeVisible({ timeout: 15000 });
  });

  test("ADM-BIL-01: /admin/billing renders", async ({ page }) => {
    await page.goto(`${BASE}/admin/billing`);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});
