import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: 'http://127.0.0.1:4177',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      // Directory redirects and real 404s expose missing output hidden by SPA fallback.
      command: 'npm run preview -- --port 4177',
      url: 'http://127.0.0.1:4177',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev',
      env: { VITOR_PRODUCTION: '1', NODE_ENV: 'production' },
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev:drafts',
      env: { VITOR_PRODUCTION: '1', NODE_ENV: 'production' },
      url: 'http://127.0.0.1:5178',
      reuseExistingServer: false,
    },
  ],
})
