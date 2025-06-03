import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Dota 2 Companion/i)
    
    // Check for main navigation
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check for hero search functionality
    await expect(page.getByPlaceholderText(/search by steam id/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /search/i })).toBeVisible()
  })

  test('should display hero sections', async ({ page }) => {
    // Wait for heroes to load
    await page.waitForSelector('[data-testid="hero-section"]', { timeout: 10000 })
    
    // Check that hero images are loaded
    const heroImages = page.locator('img[alt*="hero"]')
    await expect(heroImages.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that mobile navigation works
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check that search is still functional
    await expect(page.getByPlaceholderText(/search by steam id/i)).toBeVisible()
  })

  test('should handle offline state', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    
    // Reload page
    await page.reload()
    
    // Should show offline notice
    await expect(page.getByText(/offline/i)).toBeVisible()
    
    // Go back online
    await context.setOffline(false)
    
    // Offline notice should disappear
    await expect(page.getByText(/offline/i)).not.toBeVisible({ timeout: 5000 })
  })

  test('should load PWA manifest', async ({ page }) => {
    // Check that manifest is linked
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
    
    // Navigate to manifest and check it loads
    const manifestResponse = await page.goto('/manifest.json')
    expect(manifestResponse?.status()).toBe(200)
    
    const manifestContent = await manifestResponse?.json()
    expect(manifestContent.name).toBe('Dota 2 Companion')
  })

  test('should register service worker', async ({ page }) => {
    // Check that service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        return !!registration
      }
      return false
    })
    
    expect(swRegistered).toBe(true)
  })
})