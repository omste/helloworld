import { test, expect } from '@playwright/test';

test.describe('Message Feature', () => {
  test('should display welcome message on home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for tRPC query to complete and message to be displayed
    const contentBox = await page.waitForSelector('.content-box');
    const message = await contentBox.textContent();
    expect(message).toBeTruthy();
    expect(message).toContain('Hello');
    
    // Check if the background image is loaded
    const backgroundImage = await page.locator('img[alt="Cherry blossom tree against blue sky"]');
    await expect(backgroundImage).toBeVisible();
  });

  test('should handle tRPC errors gracefully', async ({ page }) => {
    // Mock the tRPC endpoint to return an error
    await page.route('**/api/trpc/greeting*', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: {
            message: 'Internal Server Error',
            code: 'INTERNAL_SERVER_ERROR'
          }
        })
      });
    });

    await page.goto('/');
    
    // Error boundary should catch and display the error
    const errorBoundary = await page.waitForSelector('.error-boundary');
    const errorText = await errorBoundary.textContent();
    expect(errorText).toMatch(/error/i);
  });

  test('should be able to add a new message', async ({ page }) => {
    await page.goto('/');
    
    // Fill and submit a new message
    await page.fill('[data-testid="message-input"]', 'Hello from Playwright!');
    await page.click('[data-testid="submit-message"]');
    
    // Wait for success notification
    const notification = await page.waitForSelector('[data-testid="success-notification"]');
    const notificationText = await notification.textContent();
    expect(notificationText).toMatch(/successfully added/i);
  });
}); 