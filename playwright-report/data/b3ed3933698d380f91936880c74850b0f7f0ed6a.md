# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/backoffice-admin.spec.ts >> Backoffice, Console & Admin >> BO-SYS-01: /backoffice/system/config redirects to /console without tenant
- Location: tests/e2e/backoffice-admin.spec.ts:82:7

# Error details

```
Error: apiRequestContext.post: read ECONNRESET
Call log:
  - → POST http://localhost:3001/api/auth/login
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.15 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 71

```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | const BASE = "http://localhost:3001";
  4   | const TEST_PASSWORD = "TestPass123!";
  5   | 
  6   | async function apiRegister(request: any, email: string, skipVerify = false) {
  7   |   return request.post(`${BASE}/api/auth/register`, {
  8   |     data: { email, password: TEST_PASSWORD, name: "BO Tester", skipVerification: skipVerify },
  9   |   });
  10  | }
  11  | 
  12  | async function apiLogin(request: any, email: string) {
> 13  |   return request.post(`${BASE}/api/auth/login`, {
      |                  ^ Error: apiRequestContext.post: read ECONNRESET
  14  |     data: { email, password: TEST_PASSWORD },
  15  |   });
  16  | }
  17  | 
  18  | async function setupAuth(page: Page, request: any, email: string) {
  19  |   let loginRes = await apiLogin(request, email);
  20  |   if (loginRes.status() !== 200) {
  21  |     await new Promise((r) => setTimeout(r, 500));
  22  |     loginRes = await apiLogin(request, email);
  23  |   }
  24  |   expect(loginRes.status()).toBe(200);
  25  |   const setCookie = loginRes.headers()["set-cookie"] || "";
  26  |   const tokenMatch = setCookie.match(/token=([^;]+)/);
  27  |   expect(tokenMatch).toBeTruthy();
  28  |   await page.context().addCookies([
  29  |     { name: "token", value: tokenMatch![1], domain: "localhost", path: "/" },
  30  |   ]);
  31  | }
  32  | 
  33  | test.describe.serial("Backoffice, Console & Admin", () => {
  34  |   let testEmail = "";
  35  | 
  36  |   test.beforeAll(async ({ request }) => {
  37  |     testEmail = `bo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
  38  |     await apiRegister(request, testEmail, true);
  39  |   });
  40  | 
  41  |   test.beforeEach(async ({ page, request }) => {
  42  |     await setupAuth(page, request, testEmail);
  43  |   });
  44  | 
  45  |   // Backoffice - without tenant param redirects to /console
  46  |   test("BO-DASH-01: /backoffice redirects to /console without tenant", async ({ page }) => {
  47  |     await page.goto(`${BASE}/backoffice`);
  48  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  49  |     expect(page.url()).toBe(`${BASE}/console`);
  50  |   });
  51  | 
  52  |   test("BO-USER-01: /backoffice/users redirects to /console without tenant", async ({ page }) => {
  53  |     await page.goto(`${BASE}/backoffice/users`);
  54  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  55  |     expect(page.url()).toBe(`${BASE}/console`);
  56  |   });
  57  | 
  58  |   test("BO-ACC-01: /backoffice/accounts redirects to /console without tenant", async ({ page }) => {
  59  |     await page.goto(`${BASE}/backoffice/accounts`);
  60  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  61  |     expect(page.url()).toBe(`${BASE}/console`);
  62  |   });
  63  | 
  64  |   test("BO-KYC-01: /backoffice/compliance/kyc-review redirects to /console without tenant", async ({ page }) => {
  65  |     await page.goto(`${BASE}/backoffice/compliance/kyc-review`);
  66  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  67  |     expect(page.url()).toBe(`${BASE}/console`);
  68  |   });
  69  | 
  70  |   test("BO-FUN-01: /backoffice/funds/withdrawal-review redirects to /console without tenant", async ({ page }) => {
  71  |     await page.goto(`${BASE}/backoffice/funds/withdrawal-review`);
  72  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  73  |     expect(page.url()).toBe(`${BASE}/console`);
  74  |   });
  75  | 
  76  |   test("BO-CRM-01: /backoffice/crm/tickets redirects to /console without tenant", async ({ page }) => {
  77  |     await page.goto(`${BASE}/backoffice/crm/tickets`);
  78  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  79  |     expect(page.url()).toBe(`${BASE}/console`);
  80  |   });
  81  | 
  82  |   test("BO-SYS-01: /backoffice/system/config redirects to /console without tenant", async ({ page }) => {
  83  |     await page.goto(`${BASE}/backoffice/system/config`);
  84  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  85  |     expect(page.url()).toBe(`${BASE}/console`);
  86  |   });
  87  | 
  88  |   test("BO-SYS-02: /backoffice/system/kyc-config redirects to /console without tenant", async ({ page }) => {
  89  |     await page.goto(`${BASE}/backoffice/system/kyc-config`);
  90  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  91  |     expect(page.url()).toBe(`${BASE}/console`);
  92  |   });
  93  | 
  94  |   test("BO-MOB-01: Mobile sidebar - backoffice redirects without tenant", async ({ page }) => {
  95  |     await page.setViewportSize({ width: 375, height: 667 });
  96  |     await page.goto(`${BASE}/backoffice`);
  97  |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  98  |     expect(page.url()).toBe(`${BASE}/console`);
  99  |   });
  100 | 
  101 |   // Console - these work without tenant param
  102 |   test("CON-DASH-01: /console renders", async ({ page }) => {
  103 |     await page.goto(`${BASE}/console`);
  104 |     await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  105 |   });
  106 | 
  107 |   test("CON-TEN-01: /console/tenants renders", async ({ page }) => {
  108 |     await page.goto(`${BASE}/console/tenants`);
  109 |     await expect(page.getByText("租户", { exact: false }).or(page.getByText("Tenants"))).toBeVisible({ timeout: 15000 });
  110 |   });
  111 | 
  112 |   test("CON-TEN-02: /console/tenants/new renders", async ({ page }) => {
  113 |     await page.goto(`${BASE}/console/tenants/new`);
```