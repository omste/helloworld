import { test, expect } from '@playwright/test';

test.describe('Message Feature', () => {
  test('should display welcome message on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the message is displayed
    const message = await page.textContent('.text-white');
    expect(message).toBe('Welcome to our beautiful cherry blossom world');
    
    // Check if the background image is loaded
    const backgroundImage = await page.locator('img[alt="Cherry blossom tree against blue sky"]');
    await expect(backgroundImage).toBeVisible();
  });

  test('should return welcome message from API', async ({ request }) => {
    const response = await request.get('/api/message');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toEqual({
      content: 'Welcome to our beautiful cherry blossom world'
    });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock the API to return an error
    await page.route('/api/message', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/');
    
    // Even if API fails, page should still be accessible
    await expect(page).toHaveTitle(/.+/); // Any title
    await expect(page).toBeDefined();
  });
}); 