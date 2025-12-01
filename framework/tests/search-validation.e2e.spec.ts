import { test } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';

/**
 * Example validation / edge case on the search form:
 * missing destination should not be allowed.
 */
test('user cannot search without a destination', async ({ page }) => {
  const searchPage = new SearchPage(page);

  await searchPage.submitWithMissingDestination();
  await searchPage.expectDestinationValidationError();
});
