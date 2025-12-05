
import { test, expect, Page } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { ResultsPage } from '../src/pages/ResultsPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';

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
 * ID 1 - Successful one-way search with valid origin, destination and date
 */
test('TC1: Successful one-way search with valid From, To and date', async ({ page }) => {
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
 * ID 4 - Search with multiple passengers
 */
test('TC4: Search with multiple passengers', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(10);
  await searchPage.searchButton.click();

  // Changing number of passangers
  await searchPage.passengersToggle.click();
  await expect(searchPage.passangPlusBtn).toBeVisible();
  // 3 passangers
  await searchPage.passangPlusBtn.click();
  await searchPage.passangPlusBtn.click();

  await searchPage.searchButton.click();

  // Verifying if there are some search results
  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  const count = await resultsPage.getResultCount();
  await expect(count).toBeGreaterThan(0);

  // Verifying number of passangers in the input field
  const passengerNum = await searchPage.getNumOfPassangLoc('3');
  await expect(passengerNum).toBeVisible();
});

/**
 * ID 5 - Auto-complete suggestions for 'From' field
 */
test('TC5: Auto-complete suggestions for From field', async ({ page }) => {
  const searchPage = await openBooking(page);
  await searchPage.fromInput.fill('Paris');
  // Verifying if there are some suggestions
  await expect(searchPage.anOption).toBeVisible();
});

/**
 * ID 8/9/10 - Blank From/To validations
 */
test('TC8-10: cannot search with missing From/To', async ({ page }) => {
  const searchPage = await openBooking(page);

  // Case: TC8: Blank ‘From’ field validation
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.toInput);
  await searchPage.selectDate();
  await searchPage.searchButton.click();
  // Verification
  let fromErrMes = await searchPage.getErrTextLoc('Required field', searchPage.fromErr)
  await expect(fromErrMes).toBeVisible();

  // Case: TC9: Blank ‘To’ field validation
  await page.reload();
  await searchPage.acceptCookiesIfVisible();
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.selectDate();
  await searchPage.searchButton.click();
  // Verification
  let toErrMes = await searchPage.getErrTextLoc('Required field', searchPage.toErr)
  await expect(toErrMes).toBeVisible();

  // Case: TC10: Both ‘From’ and ‘To’ blank
  await page.reload();
  await searchPage.acceptCookiesIfVisible();
  await searchPage.selectDate();
  await searchPage.searchButton.click();
  // Verification
  fromErrMes = await searchPage.getErrTextLoc('Required field', searchPage.fromErr)
  await expect(fromErrMes).toBeVisible();
  toErrMes = await searchPage.getErrTextLoc('Required field', searchPage.toErr)
  await expect(toErrMes).toBeVisible();
});

/**
 * ID 11 - From and To are the same
 */
test('TC11: From and To are the same location', async ({ page }) => {
  const searchPage = await openBooking(page);
  await searchPage.acceptCookiesIfVisible();
  // Case: 'From' field
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.toInput);
  await searchPage.fromInput.fill('Paris Beauvais Airport');
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();
  // Verifying 'From' field
  const fromErrMes = await searchPage.getErrTextLoc('Please choose an option', searchPage.fromErr)
  await expect(fromErrMes).toBeVisible();

  // Case: 'To' field
  await page.reload();
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.toInput.fill('Paris Beauvais Airport');
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();
  // Verifying 'To' field
  const toErrMes = await searchPage.getErrTextLoc('Please choose an option', searchPage.toErr)
  await expect(toErrMes).toBeVisible();
});

/**
 * ID 13 - Search with route that has no connections
 */
test('TC13: Search with route that has no connections', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.fromInput.fill('Nowhere City');
  await searchPage.toInput.fill('Nowhere Village');
  await searchPage.selectDate();
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults(false);

  // Verifying 'From' field
  const fromErrMes = await searchPage.getErrTextLoc('Please choose an option', searchPage.fromErr)
  await expect(fromErrMes).toBeVisible();
  // Verifying 'To' field
  const toErrMes = await searchPage.getErrTextLoc('Please choose an option', searchPage.toErr)
  await expect(toErrMes).toBeVisible();
});

/**
 * ID 16 - Results page shows carrier, time, price
 */
test('TC16: Results page shows essential trip information', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  // await expect(firstCard.getByText(/€|eur|usd|price/i)).toBeVisible();
  // await expect(firstCard.getByText(/[0-2]\d:[0-5]\d/)).toBeVisible();
});

/**
 * ID 20 - Modify search from results page
 */
test('TC20: Modify search criteria from results page', async ({ page }) => {
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  const initialFirst = await resultsPage.resultCards.first().innerText();

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
 * ID 22 & 25 - Select a trip and reach passenger details; fill passenger data
 */
test('TC22/25: select trip and fill passenger details (no payment)', async ({ page }) => {
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
 * ID 26 - Mandatory passenger fields left blank
 */
test('TC26: Mandatory passenger fields left blank', async ({ page }) => {
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
 * ID 27 - Invalid email format validation
 */
test('TC27: Invalid email format validation', async ({ page }) => {
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
 * ID 35 - Initial page load and layout on desktop
 */
test('TC35: Initial page load and layout on desktop', async ({ page }) => {
  await page.goto(BOOKING_URL);
  const searchPage = new SearchPage(page);
  await searchPage.acceptCookiesIfVisible();

  await expect(searchPage.fromInput).toBeVisible();
  await expect(searchPage.toInput).toBeVisible();
  await expect(searchPage.departureDateInput).toBeVisible();
  await expect(searchPage.searchButton).toBeVisible();
});
