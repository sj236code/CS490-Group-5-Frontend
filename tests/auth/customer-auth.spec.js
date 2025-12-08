// RUN COMMAND: 
// npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed

// USE CASE:
// A user can sign in as a customer

import { test, expect } from '@playwright/test';
import { loginCustomer } from '../utils/login';

test('existing test user can log in', async ({ page }) => {

  // Log browser console + page errors into CI logs
  page.on('console', (msg) => {console.log('BROWSER LOG:', msg.type(), msg.text());});
  
  page.on('pageerror', (err) => {console.log('PAGE ERROR:', err.message);});

  // Log all API calls
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      console.log('REQUEST', req.method(), req.url());
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      console.log('RESPONSE', res.status(), res.url());
    }
  });

  await page.waitForTimeout(500);

  await loginCustomer(page);

  await page.waitForTimeout(500);

  await expect(page.getByText('Playwright Tester').first()).toBeVisible();
});