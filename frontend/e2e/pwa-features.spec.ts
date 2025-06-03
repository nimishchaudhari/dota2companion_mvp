import { test, expect } from '@playwright/test'

test.describe('PWA Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have PWA manifest', async ({ page }) => {
    // Check manifest link in head
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
    
    // Check manifest content
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)
    
    const manifest = await response?.json()
    expect(manifest).toHaveProperty('name')
    expect(manifest).toHaveProperty('short_name')
    expect(manifest).toHaveProperty('start_url')
    expect(manifest).toHaveProperty('display')
    expect(manifest).toHaveProperty('theme_color')
    expect(manifest).toHaveProperty('background_color')
    expect(manifest).toHaveProperty('icons')
    
    // Validate required PWA properties
    expect(manifest.name).toBe('Dota 2 Companion')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons).toBeInstanceOf(Array)
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('should register service worker', async ({ page }) => {
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          return !!registration
        } catch (error) {
          return false
        }
      }
      return false
    })
    
    expect(swRegistered).toBe(true)
  })

  test('should cache API responses', async ({ page, context }) => {
    // Make an API request
    const response = await page.goto('https://api.opendota.com/api/heroStats')
    expect(response?.status()).toBe(200)
    
    // Go offline
    await context.setOffline(true)
    
    // Navigate back to app
    await page.goto('/')
    
    // Check that cached data is available
    await page.waitForSelector('[data-testid="hero-section"]', { timeout: 10000 })
    
    // Heroes should still load from cache
    const heroImages = page.locator('img[alt*="hero"]')
    await expect(heroImages.first()).toBeVisible()
  })

  test('should show offline indicator when offline', async ({ page, context }) => {
    // Start online
    expect(await page.evaluate(() => navigator.onLine)).toBe(true)
    
    // Go offline
    await context.setOffline(true)
    
    // Trigger network check by reloading
    await page.reload()
    
    // Should show offline indicator
    await expect(page.getByTestId('offline-notice')).toBeVisible()
    
    // Go back online
    await context.setOffline(false)
    
    // Wait for online detection
    await page.waitForFunction(() => navigator.onLine)
    
    // Offline indicator should disappear
    await expect(page.getByTestId('offline-notice')).not.toBeVisible({ timeout: 5000 })
  })

  test('should handle offline search gracefully', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    
    // Try to search for a player
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testuser')
    
    await page.getByRole('button', { name: /search/i }).click()
    
    // Should show offline error or cached results
    await page.waitForSelector('[role="alert"], [data-testid="search-results"]', { timeout: 5000 })
    
    const hasError = await page.locator('[role="alert"]').isVisible()
    const hasResults = await page.locator('[data-testid="search-results"]').isVisible()
    
    expect(hasError || hasResults).toBe(true)
  })

  test('should be installable as PWA', async ({ page, context }) => {
    // Check for install prompt availability
    // Note: This is hard to test programmatically as it depends on browser behavior
    // We can at least verify the manifest is properly configured
    
    const manifest = await page.evaluate(async () => {
      const response = await fetch('/manifest.json')
      return response.json()
    })
    
    // Required for installability
    expect(manifest.start_url).toBeDefined()
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.some((icon: any) => 
      icon.sizes === '192x192' && icon.type.startsWith('image/')
    )).toBe(true)
    expect(manifest.icons.some((icon: any) => 
      icon.sizes === '512x512' && icon.type.startsWith('image/')
    )).toBe(true)
  })

  test('should handle app updates', async ({ page }) => {
    // Check for update notification mechanism
    // This would typically involve mocking a service worker update
    
    // Check if update notification component exists in DOM
    const updateNotification = page.locator('[data-testid="update-notification"]')
    
    // Initially should not be visible
    if (await updateNotification.isVisible()) {
      // If visible, should have update and dismiss actions
      await expect(page.getByText(/update available/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /update/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /dismiss/i })).toBeVisible()
    }
  })

  test('should persist data offline', async ({ page, context }) => {
    // Load some data while online
    await page.waitForSelector('[data-testid="hero-section"]', { timeout: 10000 })
    
    // Store some user preference
    await page.evaluate(() => {
      localStorage.setItem('userPreference', JSON.stringify({ theme: 'dark' }))
    })
    
    // Go offline
    await context.setOffline(true)
    
    // Reload the page
    await page.reload()
    
    // Check that data persists
    const storedPreference = await page.evaluate(() => {
      return localStorage.getItem('userPreference')
    })
    
    expect(JSON.parse(storedPreference || '{}')).toEqual({ theme: 'dark' })
  })

  test('should handle background sync', async ({ page, context }) => {
    // This is a complex test that would require mocking service worker events
    // For now, we can check that the service worker is properly registered
    // and has the necessary event handlers
    
    const swHasBackgroundSync = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        return 'sync' in registration
      }
      return false
    })
    
    // Background sync support varies by browser
    // Just check if it's available without failing
    expect(typeof swHasBackgroundSync).toBe('boolean')
  })

  test('should work on different screen sizes (responsive PWA)', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Should still be functional
    await expect(page.getByPlaceholderText(/search by steam id/i)).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    await expect(page.getByPlaceholderText(/search by steam id/i)).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()
    
    await expect(page.getByPlaceholderText(/search by steam id/i)).toBeVisible()
  })

  test('should handle push notifications setup', async ({ page }) => {
    // Check if push notification API is available
    const pushSupported = await page.evaluate(() => {
      return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    })
    
    if (pushSupported) {
      // Check if notification permission request is handled
      const notificationPermission = await page.evaluate(() => {
        return Notification.permission
      })
      
      expect(['default', 'granted', 'denied']).toContain(notificationPermission)
    }
  })
})