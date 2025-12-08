import { expect } from '@playwright/test';

// Add a product & service to cart
export async function addProducts(page) {

    await page.getByRole('button').first().click();
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await page.getByRole('button', { name: 'Manage' }).click();
    
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.getByRole('textbox', { name: 'Product Name' }).click();
    await page.getByRole('textbox', { name: 'Product Name' }).fill('Shampoo');
    await page.getByPlaceholder('Price').click();
    await page.getByPlaceholder('Price').fill('15');
    await page.getByPlaceholder('Qty').click();
    await page.getByPlaceholder('Qty').fill('5');
    await page.locator('form').getByRole('button', { name: 'Add Product' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Add Service' }).click();
    await page.getByRole('textbox', { name: 'Service Name' }).click();
    await page.getByRole('textbox', { name: 'Service Name' }).fill('Shave');
    await page.getByPlaceholder('Price').click();
    await page.getByPlaceholder('Price').fill('20');
    await page.getByPlaceholder('Duration (minutes)').click();
    await page.getByPlaceholder('Duration (minutes)').fill('25');
    await page.locator('form').getByRole('button', { name: 'Add Service' }).click();

    await page.waitForTimeout(1000);
}