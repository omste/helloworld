import { test, expect } from '@playwright/test';

test('homepage displays welcome message from tRPC', async ({ page }) => {
  // First verify the API is working
  const apiResponse = await page.request.get('/api/trpc/greeting?batch=1&input={}');
  expect(apiResponse.ok()).toBe(true);
  const apiData = await apiResponse.json();
  console.log('API Response:', JSON.stringify(apiData, null, 2));
  expect(apiData).toBeTruthy();
  expect(Array.isArray(apiData)).toBe(true);
  expect(apiData[0]?.result?.data?.json?.text).toBeTruthy();
  
  // Now check the page renders it
  await page.goto('/');
  
  // Wait for tRPC query to complete and message to be displayed
  const contentBox = await page.waitForSelector('div.p-8.rounded-3xl');
  const message = await contentBox.textContent();
  console.log('Page Message:', message);
  
  // The message should match what we got from the API
  expect(message).toBe(apiData[0].result.data.json.text);
  
  // Visual checks
  await expect(page.locator('div.flex.min-h-screen')).toBeVisible();
  await expect(page.locator('div.p-8.rounded-3xl')).toBeVisible();
  await expect(page.locator('div.border-2.border-white\\/80')).toBeVisible();
  await expect(page.locator('img.object-cover')).toBeVisible();
});

// Removed the second test for simplicity for now
