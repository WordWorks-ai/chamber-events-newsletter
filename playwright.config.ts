import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 33100);
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"]
  ],
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: `pnpm exec next dev --port ${port}`,
        port,
        reuseExistingServer: false,
        env: {
          PORT: String(port),
          SCRAPER_FIXTURE_MODE: "true",
          SCRAPER_FIXTURE_NOW: "2026-03-14T12:00:00.000Z"
        }
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
