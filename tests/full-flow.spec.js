// RUN COMMAND:
// npx playwright test tests/full-flow.spec.js --project=firefox --headed


import { test, expect } from '@playwright/test';
import { loginEmployee, loginCustomer, loginOwner } from './utils/login';
import { createSchedule } from './utils/employee';
import { addProducts } from './utils/owner';
import { addToCart, customerCheckout, leaveReview } from './utils/customer';

test.describe.serial('entire test flow', () => {

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

    // Customer Leaves a Review
        test('customer leaves a review', async ({ page }) => {

        // Login as customer
        await loginCustomer(page);
        await page.waitForTimeout(500);

        // Leave a review
        await leaveReview(page);
        await page.waitForTimeout(500);

    })

});