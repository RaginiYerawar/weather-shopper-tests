import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests sequentially – the app is stateful (cart is session-based) */
  fullyParallel: false,
  /* Retry twice to handle the app's intentional 5% error rate */
  retries: 2,
  workers: 1,
  /* Global test timeout */
  timeout: 90_000,
  /* Reporter config */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://weathershopper.pythonanywhere.com',
    /* Run headed so you can watch the tests live */
    headless: false,
    /* Capture artefacts only when something goes wrong */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    /* Per-action & navigation timeouts */
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
