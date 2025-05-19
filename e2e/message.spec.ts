import { test, expect } from '@playwright/test';

test.describe('Message Feature', () => {
  test('should display message from database on home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for tRPC query to complete and message to be displayed
    const contentBox = await page.waitForSelector('.content-box');
    const message = await contentBox.textContent();
    expect(message).toBeTruthy();
    
    // Check if the background image is loaded
    const backgroundImage = await page.locator('img[alt="Cherry blossom tree against blue sky"]');
    await expect(backgroundImage).toBeVisible();
  });
}); 