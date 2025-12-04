// RUN COMMAND: 
// npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed

// USE CASE:
// A user can sign in as a customer

import { test, expect } from '@playwright/test';

test('existing test user can log in', async ({ page }) => {

    page.on('response', async (res) => {
        if (res.url().includes('/api/auth/login')) {
            console.log('Login response', res.url(), res.status(), await res.text());
        }
    });

    // Force Full Screen for Viewing Purposes
    await page.addInitScript(() => {
        window.moveTo(0, 0);
        window.resizeTo(screen.width, screen.height);
    });

    await page.waitForTimeout(500);

    // User clicks Sign In button
    await page.goto('/signin');

    await page.waitForTimeout(500);

    // Enter customer credentials & click sign in
    await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');

    await page.waitForTimeout(500);

    await page.getByPlaceholder('Password').fill('password123');

    await page.waitForTimeout(500);

    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    await page.waitForTimeout(500);

    // Verify login succeeded
    await expect(page).toHaveURL('/');

    await page.waitForTimeout(500);
});