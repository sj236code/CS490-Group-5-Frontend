// RUN COMMAND: 
// npx playwright test tests/auth/employee-auth.spec.js --project=firefox --headed

// USE CASE:
// A user can sign in as an employee

import { test, expect } from '@playwright/test';

// Sign into Playwright Employee Tester account
test('existing employee can log in', async ({ page }) => {

    // Force Full Screen for Viewing Purposes
    await page.addInitScript(() => {
        window.moveTo(0,0);
        window.resizeTo(screen.width, screen.height);
    });

    await page.waitForTimeout(500);

    // User clicks Sign In button
    await page.goto('/signin');

    await page.waitForTimeout(500);

    // Enter employee credentials & click sign in
    await page.getByPlaceholder('Email Address').fill('playwright_tester_emp@jade.com');

    await page.waitForTimeout(500);

    await page.getByPlaceholder('Password').fill('password123');

    await page.waitForTimeout(500);

    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    await page.waitForTimeout(500);

    // Verify login succeeses
    await expect(page).toHaveURL('/');

    await page.waitForTimeout(500);
});