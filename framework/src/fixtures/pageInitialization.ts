import { test as base } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { ResultsPage } from '../pages/ResultsPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type BookingFixtureType = {
  searchPage: SearchPage;
  resultsPage: ResultsPage;
  checkoutPage: CheckoutPage;
  bookingReady: void;
};

export const pageInitFixture = base.extend<BookingFixtureType>({
  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await page.goto("");
    await searchPage.acceptCookiesIfVisible();
    await use(searchPage);
  },

  resultsPage: async ({ page }, use) => {
    const resultsPage = new ResultsPage(page);
    await use(resultsPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  bookingReady: [
    async ({ searchPage }, use) => {
      await use();
    },
    { auto: true },
  ],
});
