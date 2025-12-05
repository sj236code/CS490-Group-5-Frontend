// RUN COMMAND:
// npx playwright test tests/customer/book-appt.spec.js --project=firefox --headed

// USE CASE:
// As a user, I want to view available barbers and time slots so that I can book easily.
// Includes booking process: select employee, select time slot, enter note, add to cart

import { test, expect } from '@playwright/test';
import { loginCustomer } from '../utils/login';

test('customer can search for a barber and add an appointment to cart', async ({ page }) => {
    // 1. Log in as the Playwright customer tester
    await loginCustomer(page);

    await page.waitForTimeout(500);

    // 2. Search for a salon / barber from the homepage search bar
    const searchBox = page.getByRole('textbox', { name: 'Service, salon,' });
    await searchBox.click();
    await page.getByRole('textbox', { name: 'Service, salon,' }).fill('P');

    await page.waitForTimeout(500);

    // 3. Select Bill's Barber Shop from the search suggestions / results
    await page.getByRole('listitem').filter({ hasText: 'PlaywrightTest' }).click();

    await page.waitForTimeout(500);

    // 3b. Click the hero search / submit button to actually navigate
    await page.locator('section').filter({ hasText: 'Find & Book LocalBeauty' }).getByRole('button').click();

    await page.waitForTimeout(500);

    // 4. Select PlaywrightTest Salon from search results & navigates to Salon Details Page
    await page.locator('div').filter({ hasText: 'PlaywrightTest12 Main Street' }).nth(3).click();

    await page.waitForTimeout(500);

    // 5. Go to the Shop tab and click Book on a service
    await page.getByRole('button', { name: 'Shop' }).click();
    await page.getByRole('button', { name: 'Book' }).first().click();

    await page.waitForTimeout(500);

    // 6. Select a barber
    await page.getByRole('button', { name: 'P Playwright TesterEmp' }).click();

    await page.waitForTimeout(500);

    // 7. Select a time slot in the calendar
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('div:nth-child(6) > div:nth-child(13) > .rbc-events-container').click();

    await page.waitForTimeout(500);

    // 8. Add a booking note
    const notesField = page.getByRole('textbox', {name: 'e.g., hair length, goals,',});

    await page.waitForTimeout(500);

    await notesField.click();
    await page.getByRole('textbox', { name: 'e.g., hair length, goals,' }).fill('Testing the service notes!');

    await page.waitForTimeout(500);

    // 9. Add to cart
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    await page.waitForTimeout(500);

    // 10. Confirm some kind of cart confirmation / UI change
    await page.getByRole('button').nth(1).click();

    await page.waitForTimeout(500);
});