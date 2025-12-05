// RUN COMMAND:
// npx playwright test tests/customer/secure-checkout.spec.js --project=firefox --headed

// USE CASE:
// As a user, I want to pay securely online so that I don’t need cash.

import { test, expect } from '@playwright/test';
import { loginCustomer } from '../utils/login';

test('customer checkout securely', async ({ page }) => {
    // 1. Log in as the Playwright customer tester
    await loginCustomer(page);

    await page.waitForTimeout(500);

    // 2. Click on Cart Button
    await page.getByRole('button').nth(1).click();

    await page.waitForTimeout(500);

    // 3. Click Checkout Button
    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.waitForTimeout(500);

    // 4. Enter Card Details
    await page.getByRole('textbox', { name: 'ex: John Doe' }).click();
    await page.getByRole('textbox', { name: 'ex: John Doe' }).fill('Playwright Test Card');
    await page.getByRole('textbox', { name: 'ex: John Doe' }).press('Tab');
    await page.getByRole('textbox', { name: '**** **** ****' }).fill('1234234534564567');
    await page.getByRole('textbox', { name: 'MM/YY' }).click();
    await page.getByRole('textbox', { name: 'MM/YY' }).fill('02/30');
    await page.getByRole('textbox', { name: 'MM/YY' }).press('Tab');
    await page.getByRole('textbox', { name: '123', exact: true }).fill('123');
    await page.getByRole('textbox', { name: '123', exact: true }).press('Tab');
    await page.getByRole('textbox', { name: '12345' }).fill('12345');

    // 5. Click Pay Button
    await page.getByRole('button', { name: 'Pay $' }).click();

    // 6. Return to Landing Page
    await page.getByRole('button', { name: 'Return to Salon' }).click();
    await expect(page).toHaveURL('/');

    await page.waitForTimeout(500);
});