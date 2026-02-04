import { defineConfig, devices } from '@playwright/test'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PREVIEW_PORT = parseInt(process.env.PREVIEW_PORT ?? '4175', 10)
const BASE_URL = `http://localhost:${PREVIEW_PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: /\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: join(__dirname, 'e2e', 'global-setup.mjs'),
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite preview --port ${PREVIEW_PORT} --strictPort`,
    url: `${BASE_URL}/`,
    reuseExistingServer: true,
    timeout: 15_000,
  },
})
