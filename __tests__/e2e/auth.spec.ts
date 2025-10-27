import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('sign in page loads correctly', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await expect(page.getByText('Sign in to DealershipAI')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible()
  })

  test('sign up page loads correctly', async ({ page }) => {
    await page.goto('/auth/signup')
    
    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign up with Google' })).toBeVisible()
  })

  test('redirects to dashboard after successful sign in', async ({ page }) => {
    // Mock successful authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-db-jwt', 'mock-jwt-token')
    })

    await page.goto('/auth/signin')
    
    // Simulate successful sign in
    await page.click('text=Sign in with Google')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('protects dashboard routes', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to sign in when not authenticated
    await expect(page).toHaveURL(/.*sign.*in.*/)
  })

  test('allows access to public pages without authentication', async ({ page }) => {
    await page.goto('/')
    
    // Should show landing page
    await expect(page.getByText('DealershipAI')).toBeVisible()
  })

  test('sign out functionality', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-db-jwt', 'mock-jwt-token')
    })

    await page.goto('/dashboard')
    
    // Click user button to open menu
    await page.click('[data-testid="user-button"]')
    
    // Click sign out
    await page.click('text=Sign out')
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/.*sign.*in.*/)
  })
})

test.describe('User Registration Flow', () => {
  test('complete signup flow', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // Fill out signup form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to complete page
    await expect(page).toHaveURL('/signup/complete')
  })

  test('signup complete page', async ({ page }) => {
    await page.goto('/signup/complete')
    
    await expect(page.getByText('Welcome to DealershipAI')).toBeVisible()
    await expect(page.getByText('Get started with your free AI audit')).toBeVisible()
  })
})
