// RUN COMMAND: 
// npx playwright test --project=firefox --headed

import { test, expect } from '@playwright/test';

// Sign into Playright Customer Tester account
test('existing test user can log in', async ({ page }) => {

    // Force Full Screen for Viewing Purposes
    await page.addInitScript(() => {
        window.moveTo(0, 0);
        window.resizeTo(screen.width, screen.height);
    });

    // User clicks Sign In button
    await page.goto('/signin');

    // Enter customer credentials & click sign in
    await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    // Verify login succeeded
    await expect(page).toHaveURL('/');
});

// Sign into Playwright Employee Tester account
test('existing employee can log in', async ({ page }) => {

    // Force Full Screen for Viewing Purposes
    await page.addInitScript(() => {
        window.moveTo(0,0);
        window.resizeTo(screen.width, screen.height);
    });

    // User clicks Sign In button
    await page.goto('/signin');

    // Enter employee credentials & click sign in
    await page.getByPlaceholder('Email Address').fill('playwright_tester_emp@jade.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    // Verify login succeeses
    await expect(page).toHaveURL('/');
});

// Sign into Playwright Salon Owner Tester account
test('existing salon owner can log in', async ({ page }) => {

    // Force Full Screen for Viewing Purposes
    await page.addInitScript(() => {
        window.moveTo(0,0);
        window.resizeTo(screen.width, screen.height);
    });

    await page.waitForTimeout(2000); // wait 2 seconds

    // User clicks Sign In button
    await page.goto('/signin');

    // Enter employee credentials & click sign in
    await page.getByPlaceholder('Email Address').fill('playwright_tester_owner@jade.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    // Verify login succeeses
    await expect(page).toHaveURL('/');
});