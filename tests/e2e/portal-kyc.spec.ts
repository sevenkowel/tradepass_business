import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3001";
const TEST_PASSWORD = "TestPass123!";

async function apiRegister(request: any, email: string, skipVerify = false) {
  return request.post(`${BASE}/api/auth/register`, {
    data: { email, password: TEST_PASSWORD, name: "KYC Tester", skipVerification: skipVerify },
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

test.describe.serial("Portal KYC Flow", () => {
  let testEmail = "";

  test.beforeAll(async ({ request }) => {
    testEmail = `kyc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
    await apiRegister(request, testEmail, true);
  });

  test.beforeEach(async ({ page, request }) => {
    await setupAuth(page, request, testEmail);
  });

  test("POR-KYC-01: /portal/kyc redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-KYC-03: /portal/kyc/document redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc/document`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-KYC-04: /portal/kyc/ocr-confirm redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc/ocr-confirm`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-KYC-05: /portal/kyc/liveness redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc/liveness`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-KYC-06: /portal/kyc/personal-info redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc/personal-info`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-KYC-07: /portal/kyc/agreements redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc/agreements`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("POR-KYC-08: /portal/kyc/status redirects to /console without tenant", async ({ page }) => {
    await page.goto(`${BASE}/portal/kyc/status`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });
});
