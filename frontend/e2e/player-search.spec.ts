import { test, expect } from '@playwright/test'

test.describe('Player Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should perform player search successfully', async ({ page }) => {
    // Enter a test search query
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testuser')
    
    // Click search button
    await page.getByRole('button', { name: /search/i }).click()
    
    // Wait for search results or error
    await page.waitForSelector('[data-testid="search-results"], [role="alert"]', { timeout: 10000 })
    
    // Should show either results or a "no players found" message
    const hasResults = await page.locator('[data-testid="search-results"]').isVisible()
    const hasError = await page.locator('[role="alert"]').isVisible()
    
    expect(hasResults || hasError).toBe(true)
  })

  test('should show validation error for empty search', async ({ page }) => {
    // Click search without entering anything
    await page.getByRole('button', { name: /search/i }).click()
    
    // Should show validation error
    await expect(page.getByText(/please enter a steam id/i)).toBeVisible()
  })

  test('should show loading state during search', async ({ page }) => {
    // Enter search query
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testuser')
    
    // Click search and immediately check for loading state
    await page.getByRole('button', { name: /search/i }).click()
    
    // Should show loading text
    await expect(page.getByText(/searching/i)).toBeVisible()
    
    // Loading should eventually disappear
    await expect(page.getByText(/searching/i)).not.toBeVisible({ timeout: 10000 })
  })

  test('should navigate to player profile when player is selected', async ({ page }) => {
    // Mock a successful search response
    await page.route('https://api.opendota.com/api/search*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          account_id: 87287966,
          personaname: 'Test Player',
          avatarfull: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg',
          similarity: 1.0
        }])
      })
    })
    
    // Perform search
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testplayer')
    await page.getByRole('button', { name: /search/i }).click()
    
    // Wait for and click on player result
    await page.waitForSelector('text=Test Player', { timeout: 10000 })
    await page.getByText('Test Player').click()
    
    // Should navigate to player profile page
    await expect(page).toHaveURL(/\/player\/\d+/)
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('https://api.opendota.com/api/search*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    // Perform search
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testplayer')
    await page.getByRole('button', { name: /search/i }).click()
    
    // Should show error message
    await expect(page.getByText(/error occurred/i)).toBeVisible()
  })

  test('should work with keyboard navigation', async ({ page }) => {
    // Focus search input with Tab
    await page.keyboard.press('Tab')
    
    // Type search query
    await page.keyboard.type('testuser')
    
    // Press Enter to search
    await page.keyboard.press('Enter')
    
    // Should trigger search
    await page.waitForSelector('[data-testid="search-results"], [role="alert"]', { timeout: 10000 })
  })

  test('should handle multiple search results', async ({ page }) => {
    // Mock multiple search results
    await page.route('https://api.opendota.com/api/search*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            account_id: 87287966,
            personaname: 'Test Player 1',
            avatarfull: 'avatar1.jpg',
            similarity: 1.0
          },
          {
            account_id: 87287967,
            personaname: 'Test Player 2',
            avatarfull: 'avatar2.jpg',
            similarity: 0.8
          }
        ])
      })
    })
    
    // Perform search
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testplayer')
    await page.getByRole('button', { name: /search/i }).click()
    
    // Should show multiple results message
    await expect(page.getByText(/multiple players found/i)).toBeVisible()
    
    // Should show both players
    await expect(page.getByText('Test Player 1')).toBeVisible()
    await expect(page.getByText('Test Player 2')).toBeVisible()
  })

  test('should clear results after selecting a player', async ({ page }) => {
    // Mock search result
    await page.route('https://api.opendota.com/api/search*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          account_id: 87287966,
          personaname: 'Test Player',
          avatarfull: 'avatar.jpg',
          similarity: 1.0
        }])
      })
    })
    
    // Perform search
    const searchInput = page.getByPlaceholderText(/search by steam id/i)
    await searchInput.fill('testplayer')
    await page.getByRole('button', { name: /search/i }).click()
    
    // Wait for results
    await page.waitForSelector('text=Test Player', { timeout: 10000 })
    
    // Click on player
    await page.getByText('Test Player').click()
    
    // Go back to home (simulate navigation)
    await page.goBack()
    
    // Search input should be cleared
    await expect(searchInput).toHaveValue('')
    
    // Results should not be visible
    await expect(page.getByText('Test Player')).not.toBeVisible()
  })
})