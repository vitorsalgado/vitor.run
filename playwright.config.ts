import { defineConfig, devices } from '@playwright/test'

const PREVIEW_PORT = 35173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PREVIEW_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npx vite preview --port ${PREVIEW_PORT}`,
    url: `http://127.0.0.1:${PREVIEW_PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
})
