// tests/utils/login.js
import { expect } from '@playwright/test';

export async function loginCustomer(page) {
  await page.goto('/signin');
  await page.getByPlaceholder('Email Address').fill('playwright_tester@jade.com');
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
}

export async function loginEmployee(page) {
  await page.goto('/signin');
  await page.getByPlaceholder('Email Address').fill('playwright_tester_emp@jade.com');
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
}

export async function loginOwner(page) {
  await page.goto('/signin');
  await page.getByPlaceholder('Email Address').fill('playwright_tester_owner@jade.com');
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
}