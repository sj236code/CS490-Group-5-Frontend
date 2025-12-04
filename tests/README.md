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

## How to run tests

All commands should be run from the frontend repo root

1. Run the full Playwright test suite ( without visual display )
```
npx playwright test
```

2. Run tests for a specific role
```
# All customer tests
npx playwright test tests/customer

# All employee tests
npx playwright test tests/employee

# All owner tests
npx playwright test tests/owner

# All auth tests
npx playwright test tests/auth
```

3. Run a single test from a specific file ( command also found in the top of each file )
```
npx playwright test tests/auth/customer-auth.spec.js
npx playwright test tests/customer/appointment-booking.spec.js
```

4. Run tests in headed mode ( visually )
```
# Single file, Firefox, headed (good for debugging)
npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed
```

## How to use codegen to automatically generate tests

1. Start you rdev server so the app is running
```
npm run dev
```

2. In a new terminal, run
```
npx playwright codegen http://localhost:5173
```

3. Two windows will open: a browser window with the site, and a Playwright Inspector window

4. Click around and fill fields as you desire the test to execute.

5. Once finished with test, at the top of the browser, click the stop button. 

6. Open the Playwright Inspector window and paste the code into the test file you want to. 

7. Clean up the code ( reduce redundancy such as using tests/utils/login.js for login )