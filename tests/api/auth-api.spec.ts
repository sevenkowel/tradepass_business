import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3001";

function uniqueEmail() {
  return `api-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
}

test.describe.serial("Auth API", () => {
  let context: any;
  let authCookie: { name: string; value: string; domain: string; path: string } | null = null;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("API-AUTH-01: POST /api/auth/login with valid creds → 200", async () => {
    // First register a user
    const email = uniqueEmail();
    await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "API Tester", skipVerification: true },
    });

    const res = await context.request.post(`${BASE}/api/auth/login`, {
      data: { email, password: "TestPass123!" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("user");
    expect(json.user).toHaveProperty("email", email);

    // Capture cookie
    const cookies = await context.cookies();
    const tokenCookie = cookies.find((c: any) => c.name === "token");
    expect(tokenCookie).toBeTruthy();
    authCookie = tokenCookie || null;
  });

  test("API-AUTH-02: POST /api/auth/login wrong password → 401", async () => {
    const email = uniqueEmail();
    await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "Tester", skipVerification: true },
    });

    const res = await context.request.post(`${BASE}/api/auth/login`, {
      data: { email, password: "WrongPassword123!" },
    });
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/invalid credentials|登录失败/i);
  });

  test("API-AUTH-03: POST /api/auth/login invalid email format → 400", async () => {
    const res = await context.request.post(`${BASE}/api/auth/login`, {
      data: { email: "not-an-email", password: "12345678" },
    });
    expect(res.status()).toBe(400);
  });

  test("API-AUTH-04: POST /api/auth/register new email → 200", async () => {
    const email = uniqueEmail();
    const res = await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "New User" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.message).toMatch(/success|成功|verify/i);
  });

  test("API-AUTH-05: POST /api/auth/register existing email → 409", async () => {
    const email = uniqueEmail();
    await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "First" },
    });
    const res = await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "Second" },
    });
    expect(res.status()).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/already registered|已被注册/i);
  });

  test("API-AUTH-06: POST /api/auth/register password < 8 chars → 400", async () => {
    const res = await context.request.post(`${BASE}/api/auth/register`, {
      data: { email: uniqueEmail(), password: "12345", name: "Short" },
    });
    expect(res.status()).toBe(400);
  });

  test("API-AUTH-07: GET /api/auth/me with valid cookie → 200", async () => {
    const email = uniqueEmail();
    await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "Me Test", skipVerification: true },
    });
    await context.request.post(`${BASE}/api/auth/login`, {
      data: { email, password: "TestPass123!" },
    });

    const res = await context.request.get(`${BASE}/api/auth/me`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("user");
    expect(json.user).toHaveProperty("email", email);
  });

  test("API-AUTH-08: GET /api/auth/me without cookie → 401", async () => {
    const freshContext = await (await import("@playwright/test")).request.newContext();
    const res = await freshContext.get(`${BASE}/api/auth/me`);
    expect(res.status()).toBe(401);
    await freshContext.dispose();
  });

  test("API-AUTH-09: POST /api/auth/logout → 200", async () => {
    const email = uniqueEmail();
    await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "Logout", skipVerification: true },
    });
    await context.request.post(`${BASE}/api/auth/login`, {
      data: { email, password: "TestPass123!" },
    });

    const res = await context.request.post(`${BASE}/api/auth/logout`);
    expect(res.status()).toBe(200);
  });
});
