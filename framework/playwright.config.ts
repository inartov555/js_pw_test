import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'https://book.distribusion.com/?retailerPartnerNumber=807197';
const artifactsDir = process.env.HOST_ARTIFACTS || 'playwright-report';

export default defineConfig({
  testDir: './tests',
  outputDir: artifactsDir,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['line'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
