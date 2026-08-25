# Weather Shopper – UI Test Automation

Playwright + TypeScript automated test suite for the
[Weather Shopper](https://weathershopper.pythonanywhere.com/) practice e-commerce application.

---

## Project structure

```
weather-shopper-tests/
├── pages/
│   ├── HomePage.ts       # Home page POM  (temperature, navigation)
│   ├── ProductPage.ts    # Product pages  (moisturizers / sunscreens)
│   └── CartPage.ts       # Cart + payment (Stripe checkout)
├── tests/
│   └── weatherShopper.spec.ts   # All tests (E2E + individual page tests)
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

### Design pattern
The project uses the **Page Object Model (POM)** to keep selectors and page
interactions separate from test assertions. Every page class exposes:
- Typed, documented methods for data extraction
- Typed, documented methods for user actions
- No raw `page.locator()` calls inside test files

---

## What is being tested

| Page | Task (from the app's tooltip) |
|------|-------------------------------|
| **Home (`/`)** | Read temperature. < 19 °C → moisturizers. > 34 °C → sunscreens. |
| **Moisturizers (`/moisturizer`)** | Add the cheapest "Aloe" product + cheapest "Almond" product to cart. |
| **Sunscreens (`/sunscreen`)** | Add the cheapest "SPF-50" product + cheapest "SPF-30" product to cart. |
| **Cart (`/cart`)** | Verify cart items and total, then complete Stripe payment. |

> **Note:** The app intentionally injects a ~5 % error rate to simulate
> real-world flakiness. `playwright.config.ts` is configured with `retries: 2`
> to handle this automatically.

---

## Prerequisites

- **Node.js** ≥ 18 (v20 recommended)
- **npm** ≥ 9
- A modern version of **Chrome / Chromium** (Playwright installs one for you)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (Chromium only, as per config)
npx playwright install chromium
```

---

## Running the tests

```bash
# Run all tests (headed – browser window is visible)
npm test

# Run with a visible browser
npm run test:headed

# Open the interactive Playwright UI mode
npm run test:ui

# View the HTML report from the last run
npm run report
```

---

## Test credentials (Stripe test mode)

The Weather Shopper app uses Stripe in test mode. The suite uses:

| Field       | Value                    |
|-------------|--------------------------|
| Email       | test@abc.com             |
| Card number | 4111 1111 1111 1111      |
| Expiry      | 12/26                    |
| CVC         | 123                      |
| ZIP code    | 12345                    |

No real charges are made.

---

## Test list

### End-to-End
- `should buy the correct products based on the current temperature and complete payment`

### Individual page tests
- `home page: should display a temperature and two purchase buttons`
- `moisturizer page: should list products with names and prices`
- `moisturizer page: should correctly identify cheapest Aloe product`
- `moisturizer page: should correctly identify cheapest Almond product`
- `sunscreen page: should list products with names and prices`
- `sunscreen page: should correctly identify cheapest SPF-50 product`
- `sunscreen page: should correctly identify cheapest SPF-30 product`
- `cart page: should be empty initially and show total of 0`
- `moisturizer flow: add two items to cart and verify cart totals`
- `sunscreen flow: add two items to cart and verify cart totals`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npx playwright install` fails | Run with `--with-deps` flag or install manually |
| Stripe iframe not found | The app may be slow; the suite waits up to 30 s for the iframe |
| Payment confirmation fails | The ~5 % error rate may have triggered; re-run the test (`retries: 2` handles this) |
| Products not found | The product list is dynamic; check the live app URL and network connectivity |
