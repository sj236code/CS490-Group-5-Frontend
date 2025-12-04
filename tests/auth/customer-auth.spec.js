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
// npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed

import { test, expect } from '@playwright/test';

test('existing test user can log in', async ({ page }) => {
  // Give this test more time in CI
  test.setTimeout(60000);

  // 🔍 Log all API calls so we can see what's going on in CI logs
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      console.log('➡️ REQUEST', req.method(), req.url());
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      console.log('⬅️ RESPONSE', res.status(), res.url());
      try {
        const body = await res.text();
        console.log('   BODY:', body.slice(0, 300)); // keep it small
      } catch (e) {
        console.log('   BODY: <non-text or failed to read>', e?.message);
      }
    }
  });

  // Optional: full screen
  await page.addInitScript(() => {
    window.moveTo(0, 0);
    window.resizeTo(screen.width, screen.height);
  });

  // Go to Sign In page
  await page.goto('/signin', { waitUntil: 'networkidle' });

  // Fill credentials
  await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');
  await page.getByPlaceholder('Password').fill('password123');

  // Click Sign In (❗️NO waitForResponse here)
  await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect to home
  await expect(page).toHaveURL('/', { timeout: 20000 });

  await page.waitForTimeout(500);
});
