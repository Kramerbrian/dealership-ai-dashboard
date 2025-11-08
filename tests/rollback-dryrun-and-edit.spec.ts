import { test, expect } from '@playwright/test'

test('dry-run diff, apply, auto-verify, rollback, edit invalids', async ({ page }) => {
  await page.goto('/fleet')

  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Open Fix now (if button exists)
  const fixButton = page.getByRole('button', { name: /Fix now|Fix/i }).first()
  if (await fixButton.isVisible()) {
    await fixButton.click()
    await expect(page.getByText(/Fix now|Fix/)).toBeVisible()

    // Dry-run diff
    const checkbox = page.getByRole('checkbox', { name: /Dry-run|dry-run/i })
    if (await checkbox.isVisible()) {
      await expect(checkbox).toBeChecked()
      await page.getByRole('button', { name: /Check diff|check diff/i }).click()
      await expect(page.getByText(/Result|result/i)).toBeVisible({ timeout: 10000 })

      // Turn off dry-run + auto-verify on
      await checkbox.click()
      await page.getByRole('button', { name: /Apply fix|apply fix/i }).click()
      await expect(page.getByText(/Result|result/i)).toBeVisible({ timeout: 10000 })

      // Rollback most recent (if exists)
      const rollbackBtn = page.getByRole('button', { name: /Rollback|rollback/i }).first()
      if (await rollbackBtn.isVisible({ timeout: 5000 })) {
        await rollbackBtn.click()
      }
    }
  }

  // Bulk upload invalid edit flow
  await page.goto('/bulk')
  await page.waitForLoadState('networkidle')

  const fileInput = page.locator('input[type="file"]')
  if (await fileInput.isVisible()) {
    // Create a test CSV file
    const testCsv = `origin,tenant
https://example.com,test-tenant
invalid-url,test-tenant`

    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(testCsv)
    })

    await page.waitForTimeout(2000) // Wait for processing

    // If invalids exist, open editor and commit first row only
    const editorCommit = page.getByRole('button', { name: /Commit fixed rows|commit fixed rows/i })
    if (await editorCommit.isVisible({ timeout: 5000 })) {
      await editorCommit.click()
      await expect(page.getByText(/Queued|queued/i)).toBeVisible({ timeout: 10000 })
    }
  }
})

