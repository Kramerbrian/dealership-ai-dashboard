import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://dealershipai.com');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DealershipAI/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display hero text correctly', async ({ page }) => {
    const heroText = page.getByText(/provides clarity in a world of digital noise/i);
    await expect(heroText).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check Product link
    const productLink = page.locator('a[href*="#product"]');
    await expect(productLink).toBeVisible();

    // Check Doctrine link
    const doctrineLink = page.locator('a[href*="#doctrine"]');
    await expect(doctrineLink).toBeVisible();

    // Check Dashboard link
    const dashboardLink = page.locator('a[href*="/dashboard"]');
    await expect(dashboardLink).toBeVisible();
  });

  test('should display AI Chat Demo Orb', async ({ page }) => {
    // Look for orb container or animation elements
    const orb = page.locator('[class*="orb"], [class*="demo"]').first();
    await expect(orb).toBeVisible({ timeout: 5000 });
  });

  test('should have working CTAs', async ({ page }) => {
    // Check "Launch Cognitive Interface" button
    const launchButton = page.getByRole('button', { name: /launch.*cognitive.*interface/i });
    if (await launchButton.count() > 0) {
      await expect(launchButton.first()).toBeVisible();
    }

    // Check Get Started button
    const getStartedButton = page.getByRole('button', { name: /get started/i });
    if (await getStartedButton.count() > 0) {
      await expect(getStartedButton.first()).toBeVisible();
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check if content is visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.count() > 0) {
      await expect(menuButton).toBeVisible();
    }
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(err => 
      !err.includes('404') && 
      !err.includes('favicon') &&
      !err.includes('warning')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://dealershipai.com');
  });

  test('should toggle mobile menu', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: /menu/i }).first();
    
    if (await menuButton.count() > 0) {
      await menuButton.click();
      
      // Check if menu opened
      const menu = page.locator('[class*="mobile-menu"], [class*="nav"]');
      await expect(menu.first()).toBeVisible();
    }
  });
});

test.describe('Performance', () => {
  test('should load in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://dealershipai.com');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('SEO Metadata', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('https://dealershipai.com');
    
    // Check description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    
    // Check OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });
});
