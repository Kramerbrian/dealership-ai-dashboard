import { test, expect } from '@playwright/test';

// Assumes you have `npx playwright test` setup and dev server running

test.describe('Bulk Upload CSV modal', () => {
  test('opens modal, uploads CSV, sees success', async ({ page }) => {
    await page.goto('http://localhost:3000/fleet');

    await page.getByRole('button', { name: 'Bulk Upload CSV' }).click();

    const input = page.locator('input[type="file"]');
    await input.setInputFiles('tests/fixtures/origins-sample.csv');

    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page.locator('text=/Imported .* rows/i')).toBeVisible({ timeout: 10000 });

    // close modal
    await page.getByRole('button', { name: 'Close' }).click();
  });
});

