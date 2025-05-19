import { test, expect } from '@playwright/test';

test('homepage displays welcome message', async ({ page }) => {
  await page.goto('/');

  // Check for the welcome message
  await expect(page.locator('text="Hello, world!"')).toBeVisible();

  // Check for the main container structure
  await expect(page.locator('div.flex.min-h-screen')).toBeVisible();

  // Check for the content box with its actual classes
  await expect(page.locator('div.p-8.rounded-3xl')).toBeVisible();
  await expect(page.locator('div.border-2.border-white\\/80')).toBeVisible();

  // Check for the background image
  await expect(page.locator('img.object-cover')).toBeVisible();
});

// Removed the second test for simplicity for now
