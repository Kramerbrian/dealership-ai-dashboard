import { test, expect } from '@playwright/test'

test.describe('Fleet bulk verify + fix now', () => {
  test('select rows → Verify Selected → open Fix now drawer', async ({ page }) => {
    await page.goto('/fleet')

    // wait table
    await expect(page.locator('table')).toBeVisible()

    // select first two rows
    const checks = page.locator('tbody input[type="checkbox"]')
    await checks.nth(0).check()
    await checks.nth(1).check()

    // bulk verify
    await page.getByRole('button', { name: 'Verify Selected' }).click()
    // no error shown
    await expect(page.locator('text=Failed').first()).toHaveCount(0)

    // open fix now on first row
    await page.getByRole('button', { name: 'Fix now' }).first().click()
    await expect(page.locator('text=Fix now —').first()).toBeVisible()

    // paste minimal snippet & apply
    const ta = page.locator('textarea')
    await ta.fill(`{"@context":"https://schema.org","@type":"AutoDealer","name":"Demo Dealer"}`)
    await page.getByRole('button', { name: 'Apply fix' }).click()

    // result block renders
    await expect(page.locator('text=Result').first()).toBeVisible()
  })
})

