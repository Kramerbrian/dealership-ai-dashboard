import { test, expect } from '@playwright/test';

const CSV = `origin,tenant
https://example-a.com,tenant-a
example-b.com,tenant-b
,tenant-x`;

test('bulk upload preview & commit', async ({ page }) => {
  // Navigate to bulk upload page
  await page.goto('/fleet/uploads');
  
  // Wait for page to load
  await page.waitForSelector('text=Choose CSV');
  
  // Upload CSV file
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Choose CSV').click(),
  ]);
  
  await fileChooser.setFiles({
    name: 'sites.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(CSV),
  });
  
  // Wait for preview to show
  await page.waitForSelector('text=Parsed:', { timeout: 10000 });
  
  // Verify counts are displayed
  await expect(page.getByText(/Parsed:/)).toBeVisible();
  await expect(page.getByText(/Unique:/)).toBeVisible();
  
  // Check that commit button is available
  const commitButton = page.getByRole('button', { name: 'Commit Import' });
  await expect(commitButton).toBeVisible();
  
  // Note: In a real test, you might want to mock the API response
  // For now, we'll just verify the UI state
  await expect(page.locator('table')).toBeVisible();
});

test('fleet table renders', async ({ page }) => {
  await page.goto('/fleet');
  
  // Wait for table to load
  await page.waitForSelector('table', { timeout: 10000 });
  
  // Verify table structure
  await expect(page.getByRole('columnheader', { name: 'Origin' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Tenant' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Evidence' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Verify' })).toBeVisible();
});

