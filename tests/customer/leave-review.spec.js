// RUN COMMAND:
// npx playwright test tests/customer/leave-review.spec.js --project=firefox --headed

// USE CASE:
// As a user, I want to leave reviews for salons so that others know my experience.

// Generate using: npx playwright codegen http://localhost:5173

import { test, expect } from '@playwright/test';
import { loginCustomer } from '../utils/login';

test('customer leaves a review', async ({ page }) => {
    // 1. Log in as the Playwright customer tester
    await loginCustomer(page);

    await page.waitForTimeout(500);

    // 2. Navigate to Salon Details page
    await page.getByText('SuperCuts1212 80th St, North').click();

    await page.waitForTimeout(500);


    // 3. Post a 3-star Review with caption
    await page.getByRole('button', { name: 'Reviews' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Post a Review' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: '★' }).nth(3).click();

    await page.waitForTimeout(500);

    await page.getByRole('textbox', { name: 'Your Review (Optional)' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('textbox', { name: 'Your Review (Optional)' }).fill('Decent experience! Would def go again!');

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Post Review' }).click();

    await page.waitForTimeout(500);

    // 4. View Review
    await page.getByRole('button', { name: 'Reviews' }).click();

    await page.waitForTimeout(500);
});