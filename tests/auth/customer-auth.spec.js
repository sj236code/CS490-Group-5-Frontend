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
  test.setTimeout(60000);

  // 🔍 Log browser console + page errors into CI logs
  page.on('console', (msg) => {
    console.log('BROWSER LOG:', msg.type(), msg.text());
  });
  page.on('pageerror', (err) => {
    console.log('PAGE ERROR:', err.message);
  });

  // 🔍 Log all API calls
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      console.log('➡️ REQUEST', req.method(), req.url());
    }
  });
  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      console.log('⬅️ RESPONSE', res.status(), res.url());
    }
  });

  await page.goto('/signin', { waitUntil: 'networkidle' });

  await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');
  await page.getByPlaceholder('Password').fill('password123');

  // explicitly wait for the login *response* and print its body
  const [loginResp] = await Promise.all([
    page
      .waitForResponse(
        (r) =>
          r.url().includes('/api/auth/login') &&
          r.request().method() === 'POST',
        { timeout: 15000 }
      )
      .catch((e) => {
        console.log('❌ waitForResponse timed out for /api/auth/login', e.message);
        return null;
      }),
    page.locator('form').getByRole('button', { name: 'Sign In' }).click(),
  ]);

  if (!loginResp) {
    throw new Error('Login API did not respond within 15s');
  }

  const status = loginResp.status();
  const bodyText = await loginResp.text();
  console.log('🔎 LOGIN STATUS:', status);
  console.log('🔎 LOGIN BODY:', bodyText.slice(0, 500));

  if (status !== 200) {
    throw new Error(`Login API failed with status ${status}: ${bodyText}`);
  }

  // Now expect redirect
  await expect(page).toHaveURL('/', { timeout: 20000 });
});
