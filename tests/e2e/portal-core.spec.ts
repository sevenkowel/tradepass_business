import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3001";
const TEST_PASSWORD = "TestPass123!";

async function apiRegister(request: any, email: string, skipVerify = false) {
  return request.post(`${BASE}/api/auth/register`, {
    data: { email, password: TEST_PASSWORD, name: "Portal Tester", skipVerification: skipVerify },
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

test.describe.serial("Portal Core", () => {
  let testEmail = "";

  test.beforeAll(async ({ request }) => {
    testEmail = `portal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
    await apiRegister(request, testEmail, true);
  });

  test.beforeEach(async ({ page, request }) => {
    await setupAuth(page, request, testEmail);
  });

  test("POR-DASH-01: /portal/dashboard redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/dashboard`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-FUND-01: /portal/fund redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/fund`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-FUND-02: /portal/fund/deposit redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/fund/deposit`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-FUND-06: /portal/fund/withdraw redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/fund/withdraw`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-FUND-10: /portal/fund/transfer redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/fund/transfer`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-FUND-11: /portal/fund/history redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/fund/history`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-SET-01: /portal/settings redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/settings`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-WAL-01: /portal/wallet redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/wallet`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("RESP-01: Mobile viewport /portal/dashboard redirects", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/portal/dashboard`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });
});
