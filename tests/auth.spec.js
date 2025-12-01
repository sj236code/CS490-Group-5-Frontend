// RUN COMMAND: 
// npx playwright test --project=firefox --headed

import { test, expect } from '@playwright/test';

// Sign into Playright Tester account
test('existing test user can log in', async ({ page }) => {

    //Force Full Screen for Viewing Purposes
    await page.addInitScript(() => {
        window.moveTo(0, 0);
        window.resizeTo(screen.width, screen.height);
    });

    // User clicks Sign In button
    await page.goto('/signin');

    // Enter user credentials & click sign in
    await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    // Verify login succeeded
    await expect(page).toHaveURL('/');
});
