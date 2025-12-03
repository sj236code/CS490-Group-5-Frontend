// RUN COMMAND: 
// npx playwright test tests/customer/salon-search.spec.js --project=firefox --headed

import { test, expect } from '@playwright/test';
import { loginCustomer } from '../utils/login';

test('customer searches for a salon', async ({ page }) => {
  await loginCustomer(page);
  await page.getByText('Loyalty').click();
  await expect(page.getByText('Points Balance')).toBeVisible();
});
