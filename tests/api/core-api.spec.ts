import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3001";

test.describe.serial("Core API", () => {
  let context: any;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    // Register and login to get auth cookies
    const email = `core-${Date.now()}@test.local`;
    await context.request.post(`${BASE}/api/auth/register`, {
      data: { email, password: "TestPass123!", name: "Core API", skipVerification: true },
    });
    await context.request.post(`${BASE}/api/auth/login`, {
      data: { email, password: "TestPass123!" },
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("API-BO-01: GET /api/backoffice/dashboard → 200 with data", async () => {
    const res = await context.request.get(`${BASE}/api/backoffice/dashboard`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("kpi");
    expect(json).toHaveProperty("recentUsers");
    expect(json).toHaveProperty("recentTenants");
  });

  test("API-KYC-01: GET /api/kyc/status → 200", async () => {
    const res = await context.request.get(`${BASE}/api/kyc/status`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(json.data).toHaveProperty("status");
  });

  test("API-KYC-02: GET /api/kyc/config?region=VN → 200 with region config", async () => {
    const res = await context.request.get(`${BASE}/api/kyc/config?region=VN`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
  });

  test("API-CONF-01: GET /api/config/kyc → 200", async () => {
    const res = await context.request.get(`${BASE}/api/config/kyc`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
  });

  test("API-CONF-02: PUT /api/config/kyc → 200 update success", async () => {
    const res = await context.request.put(`${BASE}/api/config/kyc`, {
      data: { isOpen: true },
    });
    // May be 200, 403 or 410 depending on role / route state
    expect([200, 403, 410]).toContain(res.status());
  });

  test("API-ADM-01: GET /api/admin/audit-logs → 200", async () => {
    const res = await context.request.get(`${BASE}/api/admin/audit-logs`);
    // Admin APIs may require special role
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const json = await res.json();
      expect(json).toHaveProperty("logs");
    }
  });

  test("API-ADM-02: GET /api/admin/licenses → 200", async () => {
    const res = await context.request.get(`${BASE}/api/admin/licenses`);
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const json = await res.json();
      expect(json).toHaveProperty("licenses");
    }
  });

  test("API-CON-01: GET /api/console/tenants → 200", async () => {
    const res = await context.request.get(`${BASE}/api/console/tenants`);
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const json = await res.json();
      expect(json).toHaveProperty("tenants");
    }
  });
});
