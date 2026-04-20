import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // 串行执行，避免数据冲突
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/report.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        },
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        launchOptions: {
          executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        },
      },
    },
  ],
  expect: {
    timeout: 15000,
  },
});
