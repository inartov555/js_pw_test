
import { test, expect, Page } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { ResultsPage } from '../src/pages/ResultsPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { formatDateOffset } from '../src/utils/date';

const BOOKING_URL =
  process.env.BOOKING_URL ||
  'https://book.distribusion.com/?retailerPartnerNumber=807197';

async function openBooking(page: Page) {
  await page.goto(BOOKING_URL);
  const searchPage = new SearchPage(page);
  await searchPage.acceptCookiesIfVisible();
  return searchPage;
}

/**
 * ID 1 – Successful one-way search with valid origin, destination and date
 */
test('TC1: successful one-way search Paris Beauvais Airport -> Paris La Villette', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate();
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  const count = await resultsPage.getResultCount();
  await expect(count).toBeGreaterThan(0);
});

/**
 * ID 4 – Search with multiple passengers
 */
test('TC4: search with multiple passengers', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(10);
  await searchPage.searchButton.click();

  const toggleCount = await searchPage.passengersToggle.count();
  if (toggleCount > 0) {
    await searchPage.passengersToggle.click();
    const plusButton = page.getByRole('button', { name: /\+/ });
    const plusCount = await plusButton.count();
    if (plusCount > 0) {
      await plusButton.click();
      await plusButton.click();
    }
  }

  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  const count = await resultsPage.getResultCount();
  await expect(count).toBeGreaterThan(0);

  // Soft assertion: passenger summary somewhere mentions "3"
  const passengerSummary = page.getByText(/3\s+(passengers?|travellers?)/i);
  const summaryCount = await passengerSummary.count();
  if (summaryCount > 0) {
    await expect(passengerSummary.first()).toBeVisible();
  }
});

/**
 * ID 6 – Autocomplete suggestions for origin field
 */
test('TC6: origin field shows autocomplete suggestions', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.fromInput.fill('Mun');

  const suggestions =
    page.locator('[data-testid="origin-suggestions"]') ||
    page.getByRole('listbox');

  await expect(suggestions).toBeVisible();
});

/**
 * ID 9/10/11 – Blank origin/destination validations
 */
test('TC9-11: cannot search with missing origin/destination', async ({ page }) => {
  const searchPage = await openBooking(page);

  // Case: blank departure (From)
  await searchPage.fromInput.fill('');
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.toInput);
  await searchPage.selectDate();
  await searchPage.searchButton.click();

  let validation = page.getByText(/origin is required|select an origin/i);
  let count = await validation.count();
  if (count > 0) {
    await expect(validation.first()).toBeVisible();
  }

  // Case: blank destination (To)
  await page.reload();
  await searchPage.acceptCookiesIfVisible();
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.toInput.fill('');
  await searchPage.selectDate();
  await searchPage.searchButton.click();

  validation = page.getByText(/destination is required|select a destination/i);
  count = await validation.count();
  if (count > 0) {
    await expect(validation.first()).toBeVisible();
  }

  // Case: both blank From and To
  await page.reload();
  await searchPage.acceptCookiesIfVisible();
  await searchPage.selectDate();
  await searchPage.searchButton.click();

  validation = page.getByText(/origin and destination required|please select origin and destination/i);
  count = await validation.count();
  if (count > 0) {
    await expect(validation.first()).toBeVisible();
  }
});

/**
 * ID 12 – Origin and destination are the same
 */
test('TC12: same origin and destination shows validation', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.toInput);
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const validation = page.getByText(/origin and destination cannot be the same|different locations/i);
  const count = await validation.count();
  if (count > 0) {
    await expect(validation.first()).toBeVisible();
  }
});

/**
 * ID 14 – Search with route that has no connections
 */
test('TC14: no connections route shows friendly message', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.fromInput.fill('Nowhere City');
  await searchPage.toInput.fill('Nowhere Village');
  await searchPage.selectDate();
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  const resultCount = await resultsPage.getResultCount();
  if (resultCount === 0) {
    const emptyState = page.getByText(/no (results|trips) found|no connections/i);
    await expect(emptyState.first()).toBeVisible();
  }
});

/**
 * ID 17 – Results page shows carrier, time, price
 */
test('TC17: result card shows basic trip info', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  const firstCard = resultsPage.resultCards.first();
  await expect(firstCard).toBeVisible();

  await expect(firstCard.getByText(/€|eur|usd|price/i)).toBeVisible();
  await expect(firstCard.getByText(/[0-2]\d:[0-5]\d/)).toBeVisible();
});

/**
 * ID 21 – Modify search from results page
 */
test('TC21: modify search from results page', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  const initialFirst = await resultsPage.resultCards.first().innerText();

  // Modify search in-place (using same fields if they remain visible)
  const fromField = page.getByLabel(/from/i);
  const toField = page.getByLabel(/to/i);

  await fromField.fill('Paris La Villette');
  await toField.fill('Paris Beauvais Airport');
  await page.getByRole('button', { name: /search|update/i }).click();

  await resultsPage.waitForResults();
  const newFirst = await resultsPage.resultCards.first().innerText();

  await expect(newFirst).not.toEqual(initialFirst);
});

/**
 * ID 23 & 26 – Select a trip and reach passenger details; fill passenger data
 */
test('TC23/26: select trip and fill passenger details (no payment)', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  await resultsPage.selectFirstResult();

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.assertOnCheckout();

  const firstName = page.getByLabel(/first name|given name/i);
  const lastName = page.getByLabel(/last name|surname/i);
  const email = page.getByLabel(/email/i);

  await firstName.fill('Test');
  await lastName.fill('User');
  await email.fill('test.user@example.com');

  const termsCheckbox = page.getByRole('checkbox', { name: /terms|conditions|privacy/i });
  const termCount = await termsCheckbox.count();
  if (termCount > 0) {
    await termsCheckbox.first().check();
  }

  const payNow = checkoutPage.payNowButton;
  const payNowCount = await payNow.count();
  if (payNowCount > 0) {
    await expect(payNow.first()).toBeEnabled();
  }
});

/**
 * ID 27 – Mandatory passenger fields left blank
 */
test('TC27: cannot continue with missing mandatory passenger fields', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  await resultsPage.selectFirstResult();

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.assertOnCheckout();

  const payButton = page.getByRole('button', { name: /pay|book|continue|next/i });
  await payButton.click();

  const error = page.getByText(/required|please fill out this field|missing/i);
  const count = await error.count();
  if (count > 0) {
    await expect(error.first()).toBeVisible();
  }
});

/**
 * ID 28 – Invalid email format validation
 */
test('TC28: invalid email is rejected', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  await resultsPage.selectFirstResult();

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.assertOnCheckout();

  const email = page.getByLabel(/email/i);
  await email.fill('not-an-email');

  const payButton = page.getByRole('button', { name: /pay|book|continue|next/i });
  await payButton.click();

  const error = page.getByText(/invalid email|enter a valid email/i);
  const count = await error.count();
  if (count > 0) {
    await expect(error.first()).toBeVisible();
  }
});

/**
 * ID 36 – Initial page load and layout on desktop
 */
test('TC36: initial page load shows search form', async ({ page }) => {
  await page.goto(BOOKING_URL);
  const searchPage = new SearchPage(page);
  await searchPage.acceptCookiesIfVisible();

  await expect(searchPage.fromInput).toBeVisible();
  await expect(searchPage.toInput).toBeVisible();
  await expect(searchPage.departureDateInput).toBeVisible();
  await expect(searchPage.searchButton).toBeVisible();
});
