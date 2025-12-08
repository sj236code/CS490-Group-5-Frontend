// RUN COMMAND: 
// npx playwright test tests/auth/employee-auth.spec.js --project=firefox --headed

// USE CASE:
// A user can sign in as an employee

import { test, expect } from '@playwright/test';
import { loginEmployee } from '../utils/login';

test('existing employee can log in', async ({ page }) => {

    // // Log browser console + page errors into the terminal
    // page.on('console', (msg) => {console.log('BROWSER LOG:', msg.type(), msg.text());});

    // page.on('pageerror', (err) => {console.log('PAGE ERROR:', err.message);});

    // // Log all API calls for debugging
    // page.on('request', (req) => {
    //     if (req.url().includes('/api/')) {
    //         console.log('REQUEST', req.method(), req.url());
    //     }
    // });

    // page.on('response', async (res) => {
    //     if (res.url().includes('/api/')) {
    //         console.log('RESPONSE', res.status(), res.url());
    //     }
    // });

    await page.waitForTimeout(500);

    // Use the shared login helper (keeps tests clean + consistent)
    await loginEmployee(page);

    await page.waitForTimeout(500);

    // Verify employee dashboard loaded
    await expect(page).toHaveURL('/');

    await page.waitForTimeout(500);
});
