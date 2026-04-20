import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3001";
const TEST_PASSWORD = "TestPass123!";

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
}

async function apiRegister(request: any, email: string, skipVerify = false) {
  return request.post(`${BASE}/api/auth/register`, {
    data: { email, password: TEST_PASSWORD, name: "E2E Tester", skipVerification: skipVerify },
  });
}

async function apiLogin(request: any, email: string, password = TEST_PASSWORD) {
  return request.post(`${BASE}/api/auth/login`, {
    data: { email, password },
  });
}

async function setAuthCookie(page: Page, request: any, email: string) {
  let res = await apiLogin(request, email);
  if (res.status() !== 200) {
    await new Promise((r) => setTimeout(r, 500));
    res = await apiLogin(request, email);
  }
  expect(res.status()).toBe(200);
  const setCookie = res.headers()["set-cookie"] || "";
  const tokenMatch = setCookie.match(/token=([^;]+)/);
  expect(tokenMatch).toBeTruthy();
  await page.context().addCookies([
    { name: "token", value: tokenMatch![1], domain: "localhost", path: "/" },
  ]);
}

async function safeFill(page: Page, selector: string, value: string) {
  const loc = page.locator(selector);
  await loc.waitFor({ state: "visible", timeout: 30000 });
  await loc.fill(value);
  // Next.js dev mode hydration may recreate inputs; retry if value was cleared
  const actual = await loc.inputValue().catch(() => "");
  if (actual !== value) {
    await page.waitForTimeout(600);
    await loc.fill(value);
  }
}

test.describe.serial("Auth E2E", () => {
  let testEmail = "";

  test.beforeAll(async () => {
    testEmail = uniqueEmail();
  });

  test("AUTH-01: Register with skip verification → auto-login to /console", async ({ page, request }) => {
    const email = `skip-${testEmail}`;
    const res = await apiRegister(request, email, true);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.autoLogin).toBe(true);
    expect(json.token).toBeTruthy();
    await page.context().addCookies([
      { name: "token", value: json.token, domain: "localhost", path: "/" },
    ]);
    await page.goto(`${BASE}/console`);
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("AUTH-02: Register without skip verification → verify email message", async ({ page }) => {
    const email = `noskip-${testEmail}`;
    await page.goto(`${BASE}/auth/register`);
    await safeFill(page, 'input[name="name"]', "E2E Tester");
    await safeFill(page, 'input[name="email"]', email);
    await safeFill(page, 'input[name="password"]', TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole("heading", { name: "注册成功" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("请查收验证邮件并点击链接激活账号")).toBeVisible();
    await expect(page.getByText("Demo 验证链接")).toBeVisible();
  });

  test("AUTH-03: Verify email by visiting verifyUrl", async ({ page, request }) => {
    const email = `verify-${testEmail}`;
    const res = await apiRegister(request, email, false);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.verifyUrl).toBeTruthy();
    const token = new URL(data.verifyUrl, BASE).searchParams.get("token");
    expect(token).toBeTruthy();
    const verifyRes = await request.get(`${BASE}/api/auth/verify-email?token=${token}`);
    expect(verifyRes.status()).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.success).toBe(true);
  });

  test("AUTH-04: Login with correct credentials → success, redirect to /console", async ({ page, request }) => {
    test.setTimeout(120000);
    const email = `login-${testEmail}`;
    await apiRegister(request, email, true);

    // Pre-warm /console in dev mode so Next.js compiles it ahead of time
    await page.goto(`${BASE}/console`);
    await page.waitForURL(`${BASE}/auth/login**`, { timeout: 15000 });

    await page.goto(`${BASE}/auth/login`);
    await safeFill(page, 'input[name="email"]', email);
    await safeFill(page, 'input[name="password"]', TEST_PASSWORD);
    // Extra wait to ensure React hydration finishes before click
    await page.waitForTimeout(1200);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`${BASE}/console`, { timeout: 90000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("AUTH-05: Login with wrong password → error", async ({ page, request }) => {
    const email = `wrongpwd-${testEmail}`;
    await apiRegister(request, email, true);
    await page.goto(`${BASE}/auth/login`);
    await safeFill(page, 'input[name="email"]', email);
    await safeFill(page, 'input[name="password"]', "WrongPassword123!");
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/invalid credentials|登录失败/i)).toBeVisible({ timeout: 10000 });
  });

  test("AUTH-06: Login with unverified email → please verify", async ({ request }) => {
    const email = `unverified-${testEmail}`;
    await apiRegister(request, email, false);
    const res = await apiLogin(request, email);
    expect(res.status()).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/verify|验证/i);
  });

  test("AUTH-07: Logout → cookie cleared, redirect to /auth/login", async ({ page, request }) => {
    const email = `logout-${testEmail}`;
    await apiRegister(request, email, true);
    await setAuthCookie(page, request, email);
    await page.context().clearCookies();
    await page.goto(`${BASE}/portal/dashboard`, { waitUntil: "commit" });
    await page.waitForURL(`${BASE}/auth/login**`, { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("AUTH-08: Middleware guard - unauthenticated accessing /portal/dashboard → redirect", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/portal/dashboard`, { waitUntil: "commit" });
    await page.waitForURL(`${BASE}/auth/login**`, { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
    await context.close();
  });

  test("AUTH-09: Already logged in visiting /auth/login → redirect to /console", async ({ page, request }) => {
    const email = `redirect-${testEmail}`;
    await apiRegister(request, email, true);
    await setAuthCookie(page, request, email);
    await page.goto(`${BASE}/auth/login`);
    await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
    expect(page.url()).toBe(`${BASE}/console`);
  });

  test("AUTH-10: Register with existing email → conflict", async ({ page, request }) => {
    const email = `dup-${testEmail}`;
    await apiRegister(request, email, true);
    await page.goto(`${BASE}/auth/register`);
    await safeFill(page, 'input[name="name"]', "Dup");
    await safeFill(page, 'input[name="email"]', email);
    await safeFill(page, 'input[name="password"]', TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/already registered|已被注册/i)).toBeVisible({ timeout: 10000 });
  });
});
