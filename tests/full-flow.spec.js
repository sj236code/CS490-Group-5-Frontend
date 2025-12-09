// RUN COMMAND:
// npx playwright test tests/full-flow.spec.js --project=firefox --headed

// CODEGEN:
// npx playwright codegen http://localhost://5173

import { test, expect } from '@playwright/test';
import { loginEmployee, loginCustomer, loginOwner } from './utils/login';
import { createSchedule, blockTime } from './utils/employee';
import { addProducts, replyReview, activateLoyalty, viewHistory, trackPayments } from './utils/owner';
import { addToCart, customerCheckout, leaveReview, editAppointment, viewLoyalty, redeemLoyalty, cancelAppt, earnPoints } from './utils/customer';

test.describe.serial('entire test flow', () => {

    let step = 0;
    const titles = [
        '1. Employee Sets Schedule/ Hours',
        '2. Salon Owner Adds Product & Services',
        '3. Salon Owner Activates & Sets up Loyalty',
        '4. Customer Schedules an Appointment',
        '5. Customer Checks Out',
        '6. Customer Views Loyalty Status',
        '7. Customer View & Edit Appointment',
        '8. Customer Leaves a Review',
        '9. Owner Replies to a Review',
        '10. Customer Redeems Loyalty Points',
        '11. Customer Cancels Appointment',
        '12. Customer Earns Loyalty Points',
        '13. Owner Views History & Transactions',
        '14. Owner Tracks Payments & Revenue',
        '15. Employee Blocks Times',
    ];

    test.beforeEach(async () => {
        const title = titles[step] ?? `Step ${step + 1}`;
        console.log('============================================');
        console.log(title);
        console.log('============================================');
        step += 1;

        // delay before
        await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    test.afterEach(async ({ page }) => {
        await page.waitForTimeout(3000);
    });

    // Employee Sets Hours
    test('employee sets schedule via UI', async ({ page }) => {

        // Login as an employee
        await loginEmployee(page);
        await page.waitForTimeout(500);

        // Set up an employee schedule
        await createSchedule(page);
        await page.waitForTimeout(500);

    });

    // Salon Owner Adds Product & Service
    test('salon owner adds a product and service to menu', async ({ page }) => {
        
        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Add Product and Service to Menu
        await addProducts(page);
        await page.waitForTimeout(500);

    })

    // Salon Owner Activates Loyalty Program 
    test('salon owner activates loyalty program', async ({ page }) => {

        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Activate program
        await activateLoyalty(page);
        await page.waitForTimeout(500);

    })

    // Customer Schedule an Appointment
    test('customer schedules appt w employee hours', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Schedule an appointment
        await addToCart(page);
        await page.waitForTimeout(500);
        
    });

    // Customer Checks Out
    test('customer check out', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Checkout with products & services in cart
        await customerCheckout(page);
        await page.waitForTimeout(500);

    })

    // Customer Views Loyalty Details
    test('customer view loyalty status after checking', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Check loyalty status
        await viewLoyalty(page);
        await page.waitForTimeout(500);

    })

    // Customer View & Edit Appointment Details
    test('customer view and edit appointment details', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // View & edit appointment details
        await editAppointment(page);
        await page.waitForTimeout(500);

    })

    // Customer Leaves a Review
    test('customer leaves a review', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Leave a review
        await leaveReview(page);
        await page.waitForTimeout(500);

    })

    // Salon Owner Replies to a Review
    test('owner replies to customer review', async ({ page }) => {

        // Login as salon owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Reply to review
        await replyReview(page);
        await page.waitForTimeout(500);

    })

    // Customer Redeems Loyalty Points During Checkout
    test('customer redeem loyalty points', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Checkout and Redeem Loyalty Points
        await redeemLoyalty(page);
        await page.waitForTimeout(500);

    })

    // Customer Cancel Appt
    test('customer cancels appt', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Customer cancel appt
        await cancelAppt(page);
        await page.waitForTimeout(500);

    })

    // Earn Loyalty Points Per Visit
    test('customer earns loyalty points per visit', async({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Customer earns loyalty points per transaction
        await earnPoints(page);
        await page.waitForTimeout(500);
    })

    // Owner View History & Transaction
    test('owner can view history', async({ page }) => {

        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Owner view history
        await viewHistory(page);
        await page.waitForTimeout(500);
    })

    // Owner Track Payments
    test('owner can track payments and manage revenue', async({ page }) => {

        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Owner view revenue metrics
        await trackPayments(page);
        await page.waitForTimeout(500);
    })

    // Barber Blocks Unavailable Time Slots
    test('employee blocks times', async({ page }) => {

        // Login as owner
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Employee can block times- no overlap appts
        await blockTime(page);
        await page.waitForTimeout(500);
    })

});