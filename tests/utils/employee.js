import { expect } from '@playwright/test';

// Set up working hours
export async function createSchedule(page) {
    await page.getByRole('button').first().click();
    await page.getByRole('button', { name: 'Scheduling' }).click();
    await page.getByRole('button', { name: 'Edit Hours' }).click();
    await page.getByRole('checkbox', { name: 'Available' }).first().check();
    await page.getByRole('checkbox', { name: 'Available' }).nth(1).check();
    await page.getByRole('checkbox', { name: 'Available' }).nth(2).check();
    await page.getByRole('checkbox', { name: 'Available' }).nth(3).check();
    await page.getByRole('checkbox', { name: 'Available' }).nth(4).check();
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'Edit Hours' }).click();
    await page.getByRole('checkbox', { name: 'Available' }).nth(5).check();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(1000);

    await page.getByText('Weekly AvailabilityYour scheduled working hours for each day Edit Hours').click();
    await page.getByRole('button', { name: 'Edit Hours' }).click();
    await page.getByRole('checkbox', { name: 'Available' }).nth(4).uncheck();
    await page.getByRole('checkbox', { name: 'Available' }).nth(3).uncheck();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(1000);
}