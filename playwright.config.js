// @ts-check
import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    headless: isCI,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        viewport: isCI ? { width: 1280, height: 720 } : null,
        launchOptions: {
          slowMo: isCI ? 0 : 250,  
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- --port=5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
