import { expect } from '@playwright/test';

// Set up working hours
export async function createSchedule(page) {
    await page.getByRole('button').first().click();
    await page.waitForTimeout(250);

    await page.getByRole('button', { name: 'Scheduling' }).click();
    
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Edit Hours' }).click();

    await page.waitForTimeout(250);

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
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(1000);
}

// Prevent overlapping appointments
export async function blockTime(page) {

    await page.getByRole('heading', { name: 'PlaywrightTest' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Shop' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Book' }).nth(1).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'P Playwright TesterEmp' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(1000);
    await page.locator('div:nth-child(6) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(1000);
    await page.locator('div:nth-child(5) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button').first().click();
    await page.waitForTimeout(750);
    await page.getByRole('button', { name: 'Appointments' }).click();
    await page.waitForTimeout(750);
    await page.getByRole('button', { name: 'Edit' }).first().click();

    await page.waitForTimeout(1000);

    await page.locator('.rbc-events-container').first().click();

    await page.waitForTimeout(1000);

    await page.locator('div:nth-child(5) > div:nth-child(13) > .rbc-events-container').click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(750);

}