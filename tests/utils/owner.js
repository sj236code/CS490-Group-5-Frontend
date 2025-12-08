import { expect } from '@playwright/test';

// Add a product & service to menu
export async function addProducts(page) {

    await page.getByRole('button').first().click();
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await page.getByRole('button', { name: 'Manage' }).click();
    
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.getByRole('textbox', { name: 'Product Name' }).click();
    await page.waitForTimeout(250);
    await page.getByRole('textbox', { name: 'Product Name' }).fill('Shampoo');
    await page.getByPlaceholder('Price').click();
    await page.waitForTimeout(250);
    await page.getByPlaceholder('Price').fill('15');
    await page.getByPlaceholder('Qty').click();
    await page.waitForTimeout(250);
    await page.getByPlaceholder('Qty').fill('5');
    await page.waitForTimeout(1000);
    await page.locator('form').getByRole('button', { name: 'Add Product' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Add Service' }).click();
    await page.getByRole('textbox', { name: 'Service Name' }).click();
    await page.waitForTimeout(250);
    await page.getByRole('textbox', { name: 'Service Name' }).fill('Shave');
    await page.getByPlaceholder('Price').click();
    await page.waitForTimeout(250);
    await page.getByPlaceholder('Price').fill('20');
    await page.getByPlaceholder('Duration (minutes)').click();
    await page.waitForTimeout(250);
    await page.getByPlaceholder('Duration (minutes)').fill('25');
    await page.waitForTimeout(1000);
    await page.locator('form').getByRole('button', { name: 'Add Service' }).click();

    await page.waitForTimeout(1000);
}

// Activate loyalty program
export async function activateLoyalty(page) {

    await page.waitForTimeout(250);

    await page.getByRole('button').first().click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Dashboard' }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Loyalty' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Activate Program' }).click();
    await page.getByPlaceholder('e.g. 100').click();
    await page.getByPlaceholder('e.g. 100').fill('50');
    await page.waitForTimeout(250);
    await page.getByPlaceholder('e.g. 1', { exact: true }).click();
    await page.getByPlaceholder('e.g. 5').fill('5');
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(1250);
}

// Reply to a review
export async function replyReview(page) {

    await page.waitForTimeout(500);

    await page.getByRole('heading', { name: 'PlaywrightTest' }).click();
    
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Reviews' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Reply' }).click();
    await page.getByRole('textbox', { name: 'Your Reply' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('textbox', { name: 'Your Reply' }).fill('Glad you had a good time! Please come again, we\'d be happy to have you. ');

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Post Reply' }).click();
    await page.getByRole('button', { name: 'Reviews' }).click();

    await page.waitForTimeout(1000);

}