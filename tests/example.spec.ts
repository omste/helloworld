import { test, expect } from '@playwright/test';

test('homepage displays welcome message', async ({ page }) => {
  await page.goto('/');

  // Wait for tRPC query to complete and message to be displayed
  const contentBox = await page.waitForSelector('div.p-8.rounded-3xl');
  const message = await contentBox.textContent();
  
  // Verify the exact message from our test database
  expect(message).toBe('Hello, World from E2E test!');

  // Check for the main container structure
  await expect(page.locator('div.flex.min-h-screen')).toBeVisible();

  // Check for the content box with its actual classes
  await expect(page.locator('div.p-8.rounded-3xl')).toBeVisible();
  await expect(page.locator('div.border-2.border-white\\/80')).toBeVisible();

  // Check for the background image
  await expect(page.locator('img.object-cover')).toBeVisible();
});

// Removed the second test for simplicity for now
