import { defineConfig, devices } from '@playwright/test'

/**
 * E2E suite (Phase 13). Requires the backend (php -S / Apache) and the
 * Vite dev server both already running — see README §7 "Running the test
 * suites". This deliberately does NOT manage those servers itself (no
 * webServer block): the backend needs a live MySQL/MariaDB connection
 * that Playwright has no business owning the lifecycle of.
 *
 * PLAYWRIGHT_CHROMIUM_PATH: set this to a pre-installed Chromium binary
 * path in sandboxed environments that block browser downloads. Leave
 * unset anywhere `npx playwright install` can run normally (CI, a normal
 * dev machine) and Playwright manages its own browser as usual.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  globalSetup: './e2e/global-setup.js',
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } } : {}),
      },
    },
  ],
})
