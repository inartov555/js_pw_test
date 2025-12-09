import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = process.env.BASE_URL || 'https://book.distribusion.com/?retailerPartnerNumber=807197';
const artifactsDir = process.env.HOST_ARTIFACTS || 'playwright-report';
const htmlResultsDir = path.join(artifactsDir, 'test-results');

export default defineConfig({
  testDir: './tests',
  outputDir: artifactsDir,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.forbidOnly,
  retries: process.env.retries ? 2 : 1,
  workers: process.env.workers ? 2 : 4,
  reporter: [
    ['line'],
    ['html', { outputFolder: htmlResultsDir, open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    navigationTimeout: 30 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'msedge',
      use: { ...devices['Desktop Edge'] },
    },
  ],
});
