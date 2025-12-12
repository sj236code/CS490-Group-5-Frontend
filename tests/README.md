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
│   ├─ book-appt.spec.js           # Book Appointment
│   ├─ secure-checkout.spec.js     # Checkout Securely
│   └─ leave-review.spec.js        # Customer leaves a review
│
├─ utils/
|   ├─ employee.js                 # Employee related helpers
|   ├─ customer.js                 # Customer related helpers
|   └─ login.js                    # Reusable login helpers for each role
|
└─ full-flow.spec.js               # Full flow script- run command in file
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

1. Start your dev server so the app is running
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

## Running Jade E2E Tests Locally (Backend + MySQL + Playwright)
This guide explains how to run the backend, seed test data, and execute Playwright tests locally using a dedicated local MySQL test database.

### 1. Create a Local MySQL Test Database

Open MySQL:
```
sudo mysql -u root -p
```

Inside MySQL, create the test DB + user:
```
CREATE DATABASE salon_app_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ciuser'@'localhost' IDENTIFIED BY 'mysql2025';
GRANT ALL PRIVILEGES ON salon_app_test.* TO 'ciuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Start the Backend (Using the Local Test DB)

Open a new terminal:
```
cd CS490-group-5-Backend
source venv/bin/activate
```

Set environment variables (only once per terminal session):
```
export SQLALCHEMY_DATABASE_URI="mysql+pymysql://ciuser:mysql2025@127.0.0.1:3306/salon_app_test"
export MYSQL_PUBLIC_URL="$SQLALCHEMY_DATABASE_URI"
export MYSQL_TEST_URL="$SQLALCHEMY_DATABASE_URI"
export TESTING="1"
export PYTHONPATH=.
export RESEND_API_KEY="dummy-ci-key"
```

### 3. Seed Playwright Test Data
(Only needed when you want to reset the DB)
```
python seed_local.py
```

This will:
- Drop all tables
- Recreate schema
- Seed Playwright test customer, employee, and owner
- Seed a salon, hours, service, loyalty program, etc.

### 4. Run the Backend Server

Keep this running while testing:
```
python main.py
```

### 5. Run Frontend Tests (Playwright)
Open a second terminal:
```
cd cs490-group-5-frontend
export VITE_API_URL="http://localhost:5000"
```

Run the full suite:
```
npx playwright test
```

Run a specific folder:
```
npx playwright test tests/customer
```

Run a single test:
```
npx playwright test tests/auth/customer-auth.spec.js
```

Run visually (headed mode):
```
npx playwright test tests/auth/customer-auth.spec.js --project=firefox --headed
```

### Quick Local Workflow (Summary)
You do not repeat everything every time.
- Set env vars once per terminal
- Backend must be running before tests
- Run Playwright tests anytime
- Only re-run seed_local.py when you want a fresh DB

### How to Use Playwright Codegen
Start dev server:
```
export VITE_API_URL="http://localhost:5000"
npm run dev
```

Open codegen in another terminal:
```
npx playwright codegen http://localhost:5173
```

Record actions → stop → copy generated code → clean it up → paste into your test file.