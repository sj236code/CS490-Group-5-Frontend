// RUN COMMAND:
// npx playwright test tests/full-flow.spec.js --project=firefox --headed

import { test, expect } from '@playwright/test';
import { loginEmployee, loginCustomer, loginOwner } from './utils/login';
import { createSchedule } from './utils/employee';
import { addProducts, replyReview, activateLoyalty, viewHistory, trackPayments } from './utils/owner';
import { addToCart, customerCheckout, leaveReview, editAppointment, viewLoyalty, redeemLoyalty, cancelAppt, earnPoints } from './utils/customer';

test.describe.serial('entire test flow', () => {

    // Employee Sets Hours
    test('employee sets schedule via UI', async ({ page }) => {

        console.log("============================================")
        console.log("1. Employee Sets Schedule/ Hours")
        console.log("============================================")

        // Login as an employee
        await loginEmployee(page);
        await page.waitForTimeout(500);

        // Set up an employee schedule
        await createSchedule(page);
        await page.waitForTimeout(500);

    });


    // Salon Owner Adds Product & Service
    test('salon owner adds a product and service to menu', async ({ page }) => {

        console.log("============================================")
        console.log("2. Salon Owner Adds Product & Services")
        console.log("============================================")
        
        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Add Product and Service to Menu
        await addProducts(page);
        await page.waitForTimeout(500);

    })

    // Salon Owner Activates Loyalty Program 
    test('salon owner activates loyalty program', async ({ page }) => {

        console.log("============================================")
        console.log("3. Salon Owner Activates & Sets up Loyalty")
        console.log("============================================")

        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Activate program
        await activateLoyalty(page);
        await page.waitForTimeout(500);

    })

    // Customer Schedule an Appointment
    test('customer schedules appt w employee hours', async ({ page }) => {

        console.log("============================================")
        console.log("4. Customer Schedules an Appointment")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Schedule an appointment
        await addToCart(page);
        await page.waitForTimeout(500);
        
    });

    // Customer Checks Out
    test('customer check out', async ({ page }) => {

        console.log("============================================")
        console.log("5. Customer Checks Out")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Checkout with products & services in cart
        await customerCheckout(page);
        await page.waitForTimeout(500);

    })

    // Customer Views Loyalty Details
    test('customer view loyalty status after checking', async ({ page }) => {

        console.log("============================================")
        console.log("6. Customer Views Loyalty Status")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Check loyalty status
        await viewLoyalty(page);
        await page.waitForTimeout(500);

    })

    // Customer View & Edit Appointment Details
    test('customer view and edit appointment details', async ({ page }) => {

        console.log("============================================")
        console.log("7. Customer Checks Out")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // View & edit appointment details
        await editAppointment(page);
        await page.waitForTimeout(500);

    })

    // Customer Leaves a Review
    test('customer leaves a review', async ({ page }) => {

        console.log("============================================")
        console.log("8. Customer Leaves a Review")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Leave a review
        await leaveReview(page);
        await page.waitForTimeout(500);

    })

    // Salon Owner Replies to a Review
    test('owner replies to customer review', async ({ page }) => {

        console.log("============================================")
        console.log("9. Owner Replies to a Review")
        console.log("============================================")

        // Login as salon owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Reply to review
        await replyReview(page);
        await page.waitForTimeout(500);

    })

    // Customer Redeems Loyalty Points During Checkout
    test('customer redeem loyalty points', async ({ page }) => {

        console.log("============================================")
        console.log("10. Customer Redeems Loyalty Points")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Checkout and Redeem Loyalty Points
        await redeemLoyalty(page);
        await page.waitForTimeout(500);

    })

    // Customer Cancel Appt
    test('customer cancels appt', async ({ page }) => {

        console.log("============================================")
        console.log("11. Customer Cancels Appointment")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Customer cancel appt
        await cancelAppt(page);
        await page.waitForTimeout(500);

    })

    // Earn Loyalty Points Per Visit
    test('customer earns loyalty points per visit', async({ page }) => {

        console.log("============================================")
        console.log("12. Customer Earns Loyalty Points")
        console.log("============================================")

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Customer earns loyalty points per transaction
        await earnPoints(page);
        await page.waitForTimeout(500);
    })

    // Owner View History & Transaction
    test('owner can view history', async({ page }) => {

        console.log("============================================")
        console.log("13. Owner View History & Transactions")
        console.log("============================================")

        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Owner view history
        await viewHistory(page);
        await page.waitForTimeout(500);
    })

    // Owner Track Payments
    test('owner can track payments and manage revenue', async({ page }) => {

        console.log("============================================")
        console.log("14. Owner Track Payments & Manage Revenue")
        console.log("============================================")

        // Login as owner
        await loginOwner(page);
        await page.waitForTimeout(500);

        // Owner view revenue metrics
        await trackPayments(page);
        await page.waitForTimeout(500);
    })

});