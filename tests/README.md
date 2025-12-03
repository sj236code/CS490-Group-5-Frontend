# Jade E2E Tests (Playwright)

This folder contains **end-to-end tests** for the Jade frontend, written with [Playwright](https://playwright.dev/).

Tests are organized by **user role** and **feature** so it’s easy to find, run, and extend coverage.

---

## Folder structure

```text
tests/
│
├─ auth/
│   ├─ customer-auth.spec.js       # Customer login
│   ├─ employee-auth.spec.js       # Employee login
│   └─ owner-auth.spec.js          # Salon owner login
│
├─ customer/
│   ├─ dashboard.spec.js           # Customer dashboard
│   ├─ salon-search.spec.js        # Search & browse salons
│   ├─ appointment-booking.spec.js # Book an appointment
│   ├─ appointment-history.spec.js # View past appointments
│   └─ loyalty.spec.js             # Customer loyalty features
│
├─ employee/
│   ├─ dashboard.spec.js
│   ├─ appointments.spec.js
│   └─ availability.spec.js
│
├─ owner/
│   ├─ dashboard.spec.js
│   ├─ employees.spec.js
│   ├─ loyalty.spec.js
│   └─ payments.spec.js
│
└─ utils/
    ├─ login.js                    # Reusable login helpers for each role
    └─ test-data.js                # Any shared test data (if needed)
```

## Naming convention:
tests/<role>/<feature>.spec.js
Example: tests/customer/appointment-booking.spec.js
