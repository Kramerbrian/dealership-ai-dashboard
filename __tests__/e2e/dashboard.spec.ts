import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard')
    
    // Mock Clerk authentication
    await page.addInitScript(() => {
      window.Clerk = {
        user: { id: 'test-user-id' },
        isSignedIn: () => true
      }
    })
  })

  test('navigates between dashboard tabs', async ({ page }) => {
    // Check that executive summary is shown by default
    await expect(page.getByText('Executive Summary')).toBeVisible()
    await expect(page.getByText('Overall AI Visibility Score')).toBeVisible()

    // Navigate to 5 Pillars tab
    await page.click('text=5 Pillars Deep Dive')
    await expect(page.getByText('5 Pillars Deep Dive')).toBeVisible()
    await expect(page.getByText('AI Visibility')).toBeVisible()

    // Navigate to Competitive Intelligence tab
    await page.click('text=Competitive Intelligence')
    await expect(page.getByText('Competitive Intelligence War Room')).toBeVisible()
    await expect(page.getByText('Your Market Position')).toBeVisible()

    // Navigate to Quick Wins tab
    await page.click('text=Quick Wins')
    await expect(page.getByText('Quick Wins & Smart Recommendations')).toBeVisible()
    await expect(page.getByText('Potential Impact')).toBeVisible()

    // Navigate to Mystery Shop tab
    await page.click('text=Mystery Shop')
    await expect(page.getByText('Mystery Shop Automation')).toBeVisible()
    await expect(page.getByText('Performance Overview')).toBeVisible()
  })

  test('displays QAI scores and metrics', async ({ page }) => {
    // Check executive summary metrics
    await expect(page.getByText('87')).toBeVisible() // QAI Score
    await expect(page.getByText('#2 of 8')).toBeVisible() // Market Position
    await expect(page.getByText('$3,200')).toBeVisible() // Monthly Opportunity

    // Check 5 pillars scores
    await page.click('text=5 Pillars Deep Dive')
    await expect(page.getByText('90')).toBeVisible() // AI Visibility score
    await expect(page.getByText('85')).toBeVisible() // Zero-Click Shield score
    await expect(page.getByText('78')).toBeVisible() // UGC Health score
  })

  test('shows tier gating for premium features', async ({ page }) => {
    // Navigate to competitive intelligence (requires PRO tier)
    await page.click('text=Competitive Intelligence')
    
    // Should show tier gate component
    await expect(page.getByTestId('tier-gate')).toBeVisible()

    // Navigate to mystery shop (requires ENTERPRISE tier)
    await page.click('text=Mystery Shop')
    
    // Should show tier gate component
    await expect(page.getByTestId('tier-gate')).toBeVisible()
  })

  test('interacts with quick wins recommendations', async ({ page }) => {
    await page.click('text=Quick Wins')
    
    // Should show recommendations
    await expect(page.getByText('Add LocalBusiness Schema Markup')).toBeVisible()
    await expect(page.getByText('Optimize Google Business Profile Categories')).toBeVisible()

    // Test filtering
    await page.click('text=Critical')
    await expect(page.getByText('Add LocalBusiness Schema Markup')).toBeVisible()

    // Test search
    await page.fill('input[placeholder="Search recommendations..."]', 'schema')
    await expect(page.getByText('Add LocalBusiness Schema Markup')).toBeVisible()
  })

  test('opens detailed views and modals', async ({ page }) => {
    // Test 5 pillars detailed view
    await page.click('text=5 Pillars Deep Dive')
    await page.click('text=AI Visibility')
    
    await expect(page.getByText('AI Visibility Deep Dive')).toBeVisible()
    await expect(page.getByText('Component Breakdown')).toBeVisible()
    await expect(page.getByText('Recommendations')).toBeVisible()

    // Close modal
    await page.click('button:has-text("Close")')

    // Test mystery shop scheduling
    await page.click('text=Mystery Shop')
    await page.click('text=Email Inquiry')
    
    await expect(page.getByText('Schedule Mystery Shop Test')).toBeVisible()
    await expect(page.getByText('Test Type')).toBeVisible()
    await expect(page.getByText('Schedule Date')).toBeVisible()
  })

  test('displays session counter and user info', async ({ page }) => {
    // Check header elements
    await expect(page.getByText('DealershipAI')).toBeVisible()
    await expect(page.getByTestId('user-button')).toBeVisible()
    
    // Check session counter (if visible)
    const sessionCounter = page.locator('text=Sessions:')
    if (await sessionCounter.isVisible()) {
      await expect(sessionCounter).toBeVisible()
    }
  })

  test('handles responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that navigation is still accessible
    await expect(page.getByText('Executive Summary')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Check that all tabs are visible
    await expect(page.getByText('5 Pillars Deep Dive')).toBeVisible()
    await expect(page.getByText('Competitive Intelligence')).toBeVisible()
  })

  test('shows loading states', async ({ page }) => {
    // Mock slow API responses
    await page.route('**/api/qai/calculate', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          score: {
            qai_star_score: 87,
            piqr_score: 90,
            hrp_score: 85,
            vai_score: 78,
            oci_score: 92,
            breakdown: {
              aiVisibility: 35,
              zeroClickShield: 20,
              ugcHealth: 20,
              geoTrust: 15,
              sgpIntegrity: 10
            }
          }
        })
      })
    })

    // Trigger QAI calculation
    await page.click('text=Run Analysis')
    
    // Should show loading state
    await expect(page.getByText('Analyzing...')).toBeVisible()
  })

  test('handles error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/qai/calculate', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    // Trigger QAI calculation
    await page.click('text=Run Analysis')
    
    // Should show error message
    await expect(page.getByText('Failed to calculate QAI')).toBeVisible()
  })
})