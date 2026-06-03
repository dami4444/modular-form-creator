import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config for the business-logic suite in ./e2e.
 *
 * Prerequisite: the backend must be running on http://localhost:5001
 * (e.g. `docker compose up -d`, or run backend/ against a local Mongo).
 * The frontend dev server is started automatically by `webServer` below.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
