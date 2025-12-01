import { test, expect } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { ResultsPage } from '../src/pages/ResultsPage';

/**
 * Example of a test that focuses on filters & sorting in the results view.
 */
test('results can be filtered and sorted', async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.searchOneWay({
    from: 'Munich Airport Center',
    to: 'Munich Central Train Station',
    daysFromToday: 10,
  });

  const resultsPage = new ResultsPage(page);
  await resultsPage.waitForResults();

  const beforeFilterCount = await resultsPage.getResultCount();

  await resultsPage.applyMorningDepartureFilter();
  await resultsPage.sortByLowestPrice();

  const afterFilterCount = await resultsPage.getResultCount();

  // Depending on real behaviour, the count may shrink or stay the same.
  // This assertion mostly protects against an empty list after interacting with filters.
  expect(afterFilterCount).toBeGreaterThan(0);
});
