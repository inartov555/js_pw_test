import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the search results listing.
 */
export class ResultsPage extends BasePage {
  readonly resultsContainer: Locator;
  readonly resultCards: Locator;
  readonly timeFilterMorning: Locator;
  readonly sortByCheapest: Locator;

  constructor(page: Page) {
    super(page);

    this.resultsContainer = page.locator('.journey-list__cards[data-tag="journey-list-cards"]');
    this.resultCards = this.resultsContainer.locator('div[data-tag="connection-card"]');
    this.timeFilterMorning = page.getByRole('button', { name: /morning|early/i });
    this.sortByCheapest = page.getByRole('button', { name: /cheapest|lowest price/i });
  }

  async waitForResults(areSearchResults: boolean = true) {
    if (areSearchResults === true) {
      await expect(this.resultCards.first()).toBeVisible();
    } else {
      const count = await this.resultCards.count();
      expect(count).toBe(0);
    }
  }

  async getResultCount(): Promise<number> {
    return this.resultCards.count();
  }

  async selectFirstResult() {
    const bookButtons = this.page.getByRole('button', { name: /book|select|continue/i });
    await expect(bookButtons.first()).toBeVisible();
    await bookButtons.first().click();
  }

  async applyMorningDepartureFilter() {
    const count = await this.timeFilterMorning.count();
    if (count > 0) {
      await this.timeFilterMorning.first().click();
    }
  }

  async sortByLowestPrice() {
    const count = await this.sortByCheapest.count();
    if (count > 0) {
      await this.sortByCheapest.first().click();
    }
  }
}
