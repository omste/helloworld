import { test, expect } from '@playwright/test';

test('homepage has expected text', async ({ page }) => {
  await page.goto('/'); // Navigate to the baseURL (root)

  // Expect a specific text to be visible on the page.
  // The default Next.js page contains "Get started by editing".
  // Let's look for a more prominent element or a unique piece of text.
  // For now, we'll use a locator that finds text containing "Get started by editing".
  await expect(page.locator('*:has-text("Get started by editing")').first()).toBeVisible();

  // You can also check for the title if you set one in layout.tsx
  // await expect(page).toHaveTitle(/Create Next App/); // Default title
});

// Removed the second test for simplicity for now
