// // RUN COMMAND: 
// // npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed

// // USE CASE:
// // A user can sign in as a customer

// import { test, expect } from '@playwright/test';

// test('existing test user can log in', async ({ page }) => {

//     page.on('response', async (res) => {
//         if (res.url().includes('/api/auth/login')) {
//             console.log('Login response', res.url(), res.status(), await res.text());
//         }
//     });

//     // Force Full Screen for Viewing Purposes
//     await page.addInitScript(() => {
//         window.moveTo(0, 0);
//         window.resizeTo(screen.width, screen.height);
//     });

//     await page.waitForTimeout(500);

//     // User clicks Sign In button
//     await page.goto('/signin');

//     await page.waitForTimeout(500);

//     // Enter customer credentials & click sign in
//     await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');

//     await page.waitForTimeout(500);

//     await page.getByPlaceholder('Password').fill('password123');

//     await page.waitForTimeout(500);

//     await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

//     await page.waitForTimeout(500);

//     // Verify login succeeded
//     await expect(page).toHaveURL('/');

//     await page.waitForTimeout(500);
// });

// RUN COMMAND:
// VITE_API_URL=http://localhost:5000 npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed

import { test, expect } from '@playwright/test';

test('existing test user can log in', async ({ page }) => {

  // ✅ Log the actual backend login response
  page.on('response', async (res) => {
    if (res.url().includes('/api/auth/login')) {
      console.log('✅ LOGIN API CALLED');
      console.log('URL:', res.url());
      console.log('STATUS:', res.status());
      console.log('BODY:', await res.text());
    }
  });

  // Force Full Screen for Viewing Purposes
  await page.addInitScript(() => {
    window.moveTo(0, 0);
    window.resizeTo(screen.width, screen.height);
  });

  // ✅ Always wait for navigation instead of raw timeouts
  await page.goto('/signin');

  await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');
  await page.getByPlaceholder('Password').fill('password123');

  // ✅ Wait for the login request AND click at same time
  const [loginResp] = await Promise.all([
    page.waitForResponse(r =>
      r.url().includes('/api/auth/login') && r.request().method() === 'POST'
    ),
    page.locator('form').getByRole('button', { name: 'Sign In' }).click(),
  ]);

  console.log('🔍 Final Login Status:', loginResp.status());

  // ✅ Now wait for redirect instead of guessing with timeout
  await page.waitForURL('/');

  await expect(page).toHaveURL('/');
});
