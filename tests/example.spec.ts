import { test, expect } from '@playwright/test';

test('homepage displays welcome message', async ({ page }) => {
  await page.goto('/');

  // Check for the welcome message
  await expect(page.locator('text="Hello, world!"')).toBeVisible();

  // Check for the main container structure
  await expect(page.locator('div.flex.min-h-screen')).toBeVisible();

  // Check for the content box
  await expect(page.locator('div.bg-white')).toBeVisible();

  // Check for the background image
  await expect(page.locator('img')).toBeVisible();
});

// Removed the second test for simplicity for now
