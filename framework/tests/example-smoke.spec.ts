import { test, expect } from '@playwright/test';

/**
 * Simple smoke test to verify that the Distribusion white‑label app is reachable.
 * Adjust title expectations and selectors to the actual environment if needed.
 */
test.describe('Smoke', () => {
  test('homepage is reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.+/);
  });
});
