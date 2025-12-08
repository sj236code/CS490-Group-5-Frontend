// Add a product & service to customer cart
export async function addToCart(page) {

    await page.getByRole('heading', { name: 'PlaywrightTest' }).click();

    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Shop' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Buy' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Book' }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'P Playwright TesterEmp' }).click();
    await page.locator('div:nth-child(3) > div:nth-child(13) > .rbc-events-container').click();

    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'e.g., hair length, goals,' }).click();
    await page.getByRole('textbox', { name: 'e.g., hair length, goals,' }).fill('Layers and angles in the front please!');
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button').nth(1).click();

}

// Checkout (given there are items in cart)
export async function customerCheckout(page) {

    await page.getByRole('button').nth(1).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: '0.00' }).click();
    await page.getByRole('textbox', { name: '0.00' }).fill('5');

    await page.getByRole('textbox', { name: 'ex: John Doe' }).click();
    await page.getByRole('textbox', { name: 'ex: John Doe' }).fill('Test Card');
    await page.getByRole('textbox', { name: '**** **** ****' }).click();
    await page.getByRole('textbox', { name: '**** **** ****' }).fill('1234123412341234');
    await page.getByRole('textbox', { name: 'MM/YY' }).click();
    await page.getByRole('textbox', { name: 'MM/YY' }).fill('08/30');
    await page.getByRole('textbox', { name: '123', exact: true }).click();
    await page.getByRole('textbox', { name: '123', exact: true }).fill('123');
    await page.getByRole('textbox', { name: '12345' }).click();
    await page.getByRole('textbox', { name: '12345' }).fill('12345');

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Pay $' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Return to Salon' }).click();

}

// View loyalty status
export async function viewLoyalty(page) {

    await page.waitForTimeout(1000);
    await page.getByRole('button').first().click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Loyalty & Rewards' }).click();
    await page.waitForTimeout(1000);

}


// Leave a review for a salon
export async function leaveReview(page) {

    await page.waitForTimeout(1000);

    await page.getByRole('heading', { name: 'PlaywrightTest' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Reviews' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Be the first to review' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '★' }).nth(3).click();
    await page.getByRole('textbox', { name: 'Your Review (Optional)' }).click();
    await page.getByRole('textbox', { name: 'Your Review (Optional)' }).fill('Great experience, def would come again!');

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Post Review' }).click();
    await page.getByRole('button', { name: 'Reviews' }).click();

    await page.waitForTimeout(1000);

}

// Edit appointment details (ie. time & notes)
export async function editAppointment(page) {

    await page.waitForTimeout(1000);

    await page.getByRole('button').first().click();
    await page.getByRole('button', { name: 'Appointments' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator('div:nth-child(4) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(250);
    await page.locator('div:nth-child(5) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(250);

    await page.getByRole('button', { name: 'Next' }).click();

    await page.waitForTimeout(500);

    await page.locator('div:nth-child(8) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(250);
    await page.locator('div:nth-child(3) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(250);
    await page.locator('div:nth-child(4) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', { name: 'e.g., hair length, goals,' }).click();
    await page.getByRole('textbox', { name: 'e.g., hair length, goals,' }).fill('Layers and angles in the front please, and thank you!');

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForTimeout(1250);

}

// Redeem loyalty points during checkout
export async function redeemLoyalty(page) {

    await page.waitForTimeout(1000);

    await page.getByRole('heading', { name: 'PlaywrightTest' }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Shop' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Book' }).nth(1).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'P Playwright TesterEmp' }).click();
    await page.locator('div:nth-child(3) > div:nth-child(13) > .rbc-events-container').click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByRole('button').nth(1).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('checkbox').first().check();

    await page.waitForTimeout(1000);
    
    await page.getByRole('textbox', { name: 'ex: John Doe' }).click();
    await page.getByRole('textbox', { name: 'ex: John Doe' }).fill('Test Card');
    await page.waitForTimeout(250);
    await page.getByRole('textbox', { name: '**** **** ****' }).click();
    await page.getByRole('textbox', { name: '**** **** ****' }).fill('1234123412341234');
    await page.waitForTimeout(250);
    await page.getByRole('textbox', { name: 'MM/YY' }).click();
    await page.getByRole('textbox', { name: 'MM/YY' }).fill('04/30');
    await page.waitForTimeout(250);
    await page.getByRole('textbox', { name: '123', exact: true }).click();
    await page.getByRole('textbox', { name: '123', exact: true }).fill('123');
    await page.waitForTimeout(250);
    await page.getByRole('textbox', { name: '12345' }).click();
    await page.getByRole('textbox', { name: '12345' }).fill('12345');

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Pay $' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Return to Salon' }).click();

    await page.waitForTimeout(500);

    await page.getByRole('button').first().click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Loyalty & Rewards' }).click();

    await page.waitForTimeout(1000);

}