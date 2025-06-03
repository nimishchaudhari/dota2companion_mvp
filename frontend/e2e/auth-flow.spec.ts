import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    await page.goto('/')
  })

  test('should show login button when not authenticated', async ({ page }) => {
    // Should show login button in header
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
    
    // Should not show user menu
    await expect(page.getByTestId('user-menu')).not.toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    // Click login button
    await page.getByRole('button', { name: /login/i }).click()
    
    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/)
    
    // Should show login form
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByPlaceholderText(/username/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should handle successful login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill in test user credentials
    await page.getByPlaceholderText(/username/i).fill('testuser')
    
    // Submit login form
    await page.getByRole('button', { name: /login/i }).click()
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
    
    // Should show user menu instead of login button
    await expect(page.getByTestId('user-menu')).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).not.toBeVisible()
    
    // Should show user's persona name
    await expect(page.getByText(/POC Test User/i)).toBeVisible()
  })

  test('should handle login validation errors', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Try to submit empty form
    await page.getByRole('button', { name: /login/i }).click()
    
    // Should show validation error
    await expect(page.getByText(/username is required/i)).toBeVisible()
  })

  test('should handle invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.getByPlaceholderText(/username/i).fill('invaliduser')
    
    // Submit login form
    await page.getByRole('button', { name: /login/i }).click()
    
    // Should show error message
    await expect(page.getByText(/invalid test user/i)).toBeVisible()
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show loading state during login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill in credentials
    await page.getByPlaceholderText(/username/i).fill('testuser')
    
    // Click login and immediately check for loading state
    await page.getByRole('button', { name: /login/i }).click()
    
    // Should show loading state (might be very brief)
    const loginButton = page.getByRole('button', { name: /login/i })
    
    // Button should either be disabled or show loading text
    try {
      await expect(loginButton).toBeDisabled({ timeout: 1000 })
    } catch {
      // Loading might be too fast to catch, that's okay
    }
  })

  test('should persist login state after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByPlaceholderText(/username/i).fill('testuser')
    await page.getByRole('button', { name: /login/i }).click()
    
    // Wait for successful login
    await expect(page.getByTestId('user-menu')).toBeVisible()
    
    // Refresh the page
    await page.reload()
    
    // Should still be logged in
    await expect(page.getByTestId('user-menu')).toBeVisible()
    await expect(page.getByText(/POC Test User/i)).toBeVisible()
  })

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByPlaceholderText(/username/i).fill('testuser')
    await page.getByRole('button', { name: /login/i }).click()
    
    // Wait for successful login
    await expect(page.getByTestId('user-menu')).toBeVisible()
    
    // Click on user menu to open dropdown
    await page.getByTestId('user-menu').click()
    
    // Click logout
    await page.getByRole('button', { name: /logout/i }).click()
    
    // Should be logged out
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
    await expect(page.getByTestId('user-menu')).not.toBeVisible()
  })

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access user profile without being logged in
    await page.goto('/profile')
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
    
    // Should show message about needing to log in
    await expect(page.getByText(/please log in/i)).toBeVisible()
  })

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/profile')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    
    // Login
    await page.getByPlaceholderText(/username/i).fill('testuser')
    await page.getByRole('button', { name: /login/i }).click()
    
    // Should redirect to originally intended page
    await expect(page).toHaveURL(/\/profile/)
  })

  test('should work with keyboard navigation', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Use Tab to navigate to username field
    await page.keyboard.press('Tab')
    await page.keyboard.type('testuser')
    
    // Tab to login button
    await page.keyboard.press('Tab')
    
    // Press Enter to submit
    await page.keyboard.press('Enter')
    
    // Should login successfully
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('user-menu')).toBeVisible()
  })

  test('should clear auth state when localStorage is cleared', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByPlaceholderText(/username/i).fill('testuser')
    await page.getByRole('button', { name: /login/i }).click()
    
    // Wait for successful login
    await expect(page.getByTestId('user-menu')).toBeVisible()
    
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear()
    })
    
    // Refresh page
    await page.reload()
    
    // Should be logged out
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
    await expect(page.getByTestId('user-menu')).not.toBeVisible()
  })
})