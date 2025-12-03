// RUN COMMAND: 
// npx playwright test tests/customer/salon-search.spec.js --project=firefox --headed

// USE CASE:
// As a user, I want to view available barbers and time slots so that I can book easily.

import { test, expect } from '@playwright/test';
import { loginCustomer } from '../utils/login';

test('customer searches for a salon', async ({ page }) => {
  await loginCustomer(page);
});
