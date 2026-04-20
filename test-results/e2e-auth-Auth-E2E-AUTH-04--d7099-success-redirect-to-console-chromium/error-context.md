# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/auth.spec.ts >> Auth E2E >> AUTH-04: Login with correct credentials → success, redirect to /console
- Location: tests/e2e/auth.spec.ts:96:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 90000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:3001/console" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "登录 TradePass" [level=1] [ref=e6]
      - paragraph [ref=e7]: 管理您的产品与租户
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: 邮箱
        - textbox [ref=e11]: login-e2e-1776492829111-hkxp1@test.local
      - generic [ref=e12]:
        - text: 密码
        - textbox [ref=e14]: TestPass123!
      - button "登录" [ref=e15] [cursor=pointer]
    - paragraph [ref=e16]:
      - text: 还没有账号？
      - link "立即注册" [ref=e17] [cursor=pointer]:
        - /url: /auth/register
  - button "Open Next.js Dev Tools" [ref=e23] [cursor=pointer]:
    - generic [ref=e26]:
      - text: Compiling
      - generic [ref=e27]:
        - generic [ref=e28]: .
        - generic [ref=e29]: .
        - generic [ref=e30]: .
  - alert [ref=e31]
```

# Test source

```ts
  11  |   return request.post(`${BASE}/api/auth/register`, {
  12  |     data: { email, password: TEST_PASSWORD, name: "E2E Tester", skipVerification: skipVerify },
  13  |   });
  14  | }
  15  | 
  16  | async function apiLogin(request: any, email: string, password = TEST_PASSWORD) {
  17  |   return request.post(`${BASE}/api/auth/login`, {
  18  |     data: { email, password },
  19  |   });
  20  | }
  21  | 
  22  | async function setAuthCookie(page: Page, request: any, email: string) {
  23  |   let res = await apiLogin(request, email);
  24  |   if (res.status() !== 200) {
  25  |     await new Promise((r) => setTimeout(r, 500));
  26  |     res = await apiLogin(request, email);
  27  |   }
  28  |   expect(res.status()).toBe(200);
  29  |   const setCookie = res.headers()["set-cookie"] || "";
  30  |   const tokenMatch = setCookie.match(/token=([^;]+)/);
  31  |   expect(tokenMatch).toBeTruthy();
  32  |   await page.context().addCookies([
  33  |     { name: "token", value: tokenMatch![1], domain: "localhost", path: "/" },
  34  |   ]);
  35  | }
  36  | 
  37  | async function safeFill(page: Page, selector: string, value: string) {
  38  |   const loc = page.locator(selector);
  39  |   await loc.waitFor({ state: "visible", timeout: 30000 });
  40  |   await loc.fill(value);
  41  |   // Next.js dev mode hydration may recreate inputs; retry if value was cleared
  42  |   const actual = await loc.inputValue().catch(() => "");
  43  |   if (actual !== value) {
  44  |     await page.waitForTimeout(600);
  45  |     await loc.fill(value);
  46  |   }
  47  | }
  48  | 
  49  | test.describe.serial("Auth E2E", () => {
  50  |   let testEmail = "";
  51  | 
  52  |   test.beforeAll(async () => {
  53  |     testEmail = uniqueEmail();
  54  |   });
  55  | 
  56  |   test("AUTH-01: Register with skip verification → auto-login to /console", async ({ page, request }) => {
  57  |     const email = `skip-${testEmail}`;
  58  |     const res = await apiRegister(request, email, true);
  59  |     expect(res.status()).toBe(200);
  60  |     const json = await res.json();
  61  |     expect(json.autoLogin).toBe(true);
  62  |     expect(json.token).toBeTruthy();
  63  |     await page.context().addCookies([
  64  |       { name: "token", value: json.token, domain: "localhost", path: "/" },
  65  |     ]);
  66  |     await page.goto(`${BASE}/console`);
  67  |     expect(page.url()).toBe(`${BASE}/console`);
  68  |   });
  69  | 
  70  |   test("AUTH-02: Register without skip verification → verify email message", async ({ page }) => {
  71  |     const email = `noskip-${testEmail}`;
  72  |     await page.goto(`${BASE}/auth/register`);
  73  |     await safeFill(page, 'input[name="name"]', "E2E Tester");
  74  |     await safeFill(page, 'input[name="email"]', email);
  75  |     await safeFill(page, 'input[name="password"]', TEST_PASSWORD);
  76  |     await page.locator('button[type="submit"]').click();
  77  |     await expect(page.getByRole("heading", { name: "注册成功" })).toBeVisible({ timeout: 10000 });
  78  |     await expect(page.getByText("请查收验证邮件并点击链接激活账号")).toBeVisible();
  79  |     await expect(page.getByText("Demo 验证链接")).toBeVisible();
  80  |   });
  81  | 
  82  |   test("AUTH-03: Verify email by visiting verifyUrl", async ({ page, request }) => {
  83  |     const email = `verify-${testEmail}`;
  84  |     const res = await apiRegister(request, email, false);
  85  |     expect(res.status()).toBe(200);
  86  |     const data = await res.json();
  87  |     expect(data.verifyUrl).toBeTruthy();
  88  |     const token = new URL(data.verifyUrl, BASE).searchParams.get("token");
  89  |     expect(token).toBeTruthy();
  90  |     const verifyRes = await request.get(`${BASE}/api/auth/verify-email?token=${token}`);
  91  |     expect(verifyRes.status()).toBe(200);
  92  |     const verifyJson = await verifyRes.json();
  93  |     expect(verifyJson.success).toBe(true);
  94  |   });
  95  | 
  96  |   test("AUTH-04: Login with correct credentials → success, redirect to /console", async ({ page, request }) => {
  97  |     test.setTimeout(120000);
  98  |     const email = `login-${testEmail}`;
  99  |     await apiRegister(request, email, true);
  100 | 
  101 |     // Pre-warm /console in dev mode so Next.js compiles it ahead of time
  102 |     await page.goto(`${BASE}/console`);
  103 |     await page.waitForURL(`${BASE}/auth/login**`, { timeout: 15000 });
  104 | 
  105 |     await page.goto(`${BASE}/auth/login`);
  106 |     await safeFill(page, 'input[name="email"]', email);
  107 |     await safeFill(page, 'input[name="password"]', TEST_PASSWORD);
  108 |     // Extra wait to ensure React hydration finishes before click
  109 |     await page.waitForTimeout(1200);
  110 |     await page.locator('button[type="submit"]').click();
> 111 |     await page.waitForURL(`${BASE}/console`, { timeout: 90000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 90000ms exceeded.
  112 |     expect(page.url()).toBe(`${BASE}/console`);
  113 |   });
  114 | 
  115 |   test("AUTH-05: Login with wrong password → error", async ({ page, request }) => {
  116 |     const email = `wrongpwd-${testEmail}`;
  117 |     await apiRegister(request, email, true);
  118 |     await page.goto(`${BASE}/auth/login`);
  119 |     await safeFill(page, 'input[name="email"]', email);
  120 |     await safeFill(page, 'input[name="password"]', "WrongPassword123!");
  121 |     await page.locator('button[type="submit"]').click();
  122 |     await expect(page.getByText(/invalid credentials|登录失败/i)).toBeVisible({ timeout: 10000 });
  123 |   });
  124 | 
  125 |   test("AUTH-06: Login with unverified email → please verify", async ({ request }) => {
  126 |     const email = `unverified-${testEmail}`;
  127 |     await apiRegister(request, email, false);
  128 |     const res = await apiLogin(request, email);
  129 |     expect(res.status()).toBe(403);
  130 |     const json = await res.json();
  131 |     expect(json.error).toMatch(/verify|验证/i);
  132 |   });
  133 | 
  134 |   test("AUTH-07: Logout → cookie cleared, redirect to /auth/login", async ({ page, request }) => {
  135 |     const email = `logout-${testEmail}`;
  136 |     await apiRegister(request, email, true);
  137 |     await setAuthCookie(page, request, email);
  138 |     await page.context().clearCookies();
  139 |     await page.goto(`${BASE}/portal/dashboard`, { waitUntil: "commit" });
  140 |     await page.waitForURL(`${BASE}/auth/login**`, { timeout: 10000 });
  141 |     expect(page.url()).toContain("/auth/login");
  142 |   });
  143 | 
  144 |   test("AUTH-08: Middleware guard - unauthenticated accessing /portal/dashboard → redirect", async ({ browser }) => {
  145 |     const context = await browser.newContext();
  146 |     const page = await context.newPage();
  147 |     await page.goto(`${BASE}/portal/dashboard`, { waitUntil: "commit" });
  148 |     await page.waitForURL(`${BASE}/auth/login**`, { timeout: 10000 });
  149 |     expect(page.url()).toContain("/auth/login");
  150 |     await context.close();
  151 |   });
  152 | 
  153 |   test("AUTH-09: Already logged in visiting /auth/login → redirect to /console", async ({ page, request }) => {
  154 |     const email = `redirect-${testEmail}`;
  155 |     await apiRegister(request, email, true);
  156 |     await setAuthCookie(page, request, email);
  157 |     await page.goto(`${BASE}/auth/login`);
  158 |     await page.waitForURL(`${BASE}/console`, { timeout: 10000 });
  159 |     expect(page.url()).toBe(`${BASE}/console`);
  160 |   });
  161 | 
  162 |   test("AUTH-10: Register with existing email → conflict", async ({ page, request }) => {
  163 |     const email = `dup-${testEmail}`;
  164 |     await apiRegister(request, email, true);
  165 |     await page.goto(`${BASE}/auth/register`);
  166 |     await safeFill(page, 'input[name="name"]', "Dup");
  167 |     await safeFill(page, 'input[name="email"]', email);
  168 |     await safeFill(page, 'input[name="password"]', TEST_PASSWORD);
  169 |     await page.locator('button[type="submit"]').click();
  170 |     await expect(page.getByText(/already registered|已被注册/i)).toBeVisible({ timeout: 10000 });
  171 |   });
  172 | });
  173 | 
```