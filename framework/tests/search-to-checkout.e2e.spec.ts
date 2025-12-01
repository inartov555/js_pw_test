import { test, expect } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { ResultsPage } from '../src/pages/ResultsPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';

/**
 * Critical user flow:
 * search -> view results -> go to checkout
 * We intentionally stop before any payment step.
 */
test('user can search, view results, and reach checkout (without paying)', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.searchOneWay({
    from: 'Munich Airport Center',
    to: 'Munich Central Train Station',
    daysFromToday: 7,
    passengers: 1,
  });

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();
  const initialCount = await resultsPage.getResultCount();
  expect(initialCount).toBeGreaterThan(0);

  await resultsPage.selectFirstResult();

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.assertOnCheckout();
  await checkoutPage.assertPayNowIsVisibleButNotClicked();
});
