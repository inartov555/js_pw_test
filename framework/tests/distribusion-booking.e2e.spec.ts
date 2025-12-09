
import { test, expect, Page } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { ResultsPage } from '../src/pages/ResultsPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { SearchNameFromToType } from '../src/utils/types';

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
 * ID 1 - Successful one-way search with valid From, To and date
 */
const tc1SearchCases: SearchNameFromToType[] = [
  {
    name: 'Paris Beauvais Airport -> Paris La Villette',
    from: 'Paris Beauvais Airport',
    to: 'Paris La Villette',
  },
  {
    name: 'Paris, Saint-Denis Université -> Paris Beauvais Airport',
    from: 'Paris, Saint-Denis Université',
    to: 'Paris Beauvais Airport',
  },
];
test.describe.parallel('TC1: Successful one-way search with valid From, To and date', () => {
  for (const { name, from, to } of tc1SearchCases) {
    test(name, async ({ page }) => {
      const searchPage = await openBooking(page);

      await searchPage.typeToFromPoint(from, searchPage.fromInput);
      await searchPage.typeToFromPoint(to, searchPage.toInput);
      await searchPage.selectDate();
      await searchPage.searchButton.click();

      const resultsPage = new ResultsPage(page);
      await resultsPage.waitForResults();
      const count = await resultsPage.getResultCount();
      await expect(count).toBeGreaterThan(0);
    });
  }
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
  await expect(searchPage.passangPlusBtn).toBeEnabled();
  // 3 passangers
  await searchPage.passangPlusBtn.click();
  const passengerNum1 = searchPage.getNumOfPassangLoc('2');
  await expect(passengerNum1).toBeVisible();
  await searchPage.passangPlusBtn.click();
  const passengerNum2 = searchPage.getNumOfPassangLoc('3');
  await expect(passengerNum2).toBeVisible();
  await searchPage.searchButton.click();

  // Verifying if there are some search results
  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  const count = await resultsPage.getResultCount();
  await expect(count).toBeGreaterThan(0);

  // Verifying number of passangers in the input field
  const passengerNum3 = searchPage.getNumOfPassangLoc('3');
  // await page.waitForTimeout(10000);
  await expect(passengerNum3).toBeVisible();
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
  /*
   * TODO: add checks for other elements of a result card
   */
  const searchPage = await openBooking(page);

  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  const firstCard = resultsPage.resultCards.first();
  const priceLoc = await resultsPage.getPriceLoc(firstCard);
  const price = await priceLoc.textContent();
  // Verifying Price
  await expect(price?.trim().length).toBeGreaterThan(1);
  await expect(priceLoc).toHaveText(/\d+/);
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

  const initialFirst = await resultsPage.resultCards.first().textContent();

  await searchPage.typeToFromPoint('Paris La Villette', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.toInput);
  await searchPage.searchButton.click();

  await resultsPage.waitForResults();
  const newFirst = await resultsPage.resultCards.first().textContent();

  await expect(newFirst).not.toEqual(initialFirst);
});

/**
 * ID 22 & 25 - Select a trip and reach passenger details; fill passenger data
 */
test('TC22/25: select trip and fill passenger details, no payment', async ({ page }) => {
  const searchPage = await openBooking(page);

  // Case: TC22 - Select a trip and proceed to passenger details
  await searchPage.typeToFromPoint('Paris Beauvais Airport', searchPage.fromInput);
  await searchPage.typeToFromPoint('Paris La Villette', searchPage.toInput);
  await searchPage.selectDate(7);
  await searchPage.searchButton.click();

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  await resultsPage.selectFirstResult();

  const checkoutPage = new CheckoutPage(page);
  // Verifying if checkout page key elements are loaded
  await checkoutPage.waitForLoaded();

  // Case: TC25 - Successful entry of passenger details
  await checkoutPage.firstName.fill('Test');
  await checkoutPage.lastName.fill('User');
  await checkoutPage.email.fill('test.user@example.com');
  await checkoutPage.emailConfirm.fill('test.user@example.com');

  // Verifying if filled in fields have previously set values
  await expect(checkoutPage.firstName).toHaveValue('Test');
  await expect(checkoutPage.lastName).toHaveValue('User');
  await expect(checkoutPage.email).toHaveValue('test.user@example.com');
  await expect(checkoutPage.emailConfirm).toHaveValue('test.user@example.com');
});

/**
 * ID 35 - Initial page load and layout on desktop
 */
test('TC35: Initial page load and layout on desktop', async ({ page }) => {
  const searchPage = await openBooking(page);
  await expect(searchPage.fromInput).toBeVisible();
  await expect(searchPage.toInput).toBeVisible();
  await expect(searchPage.departureDateInput).toBeVisible();
  await expect(searchPage.searchButton).toBeVisible();
});
