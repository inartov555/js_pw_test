import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the search results listing.
 */
export class ResultsPage extends BasePage {
  readonly resultsContainer: Locator;
  readonly resultCards: Locator;
  readonly sortResultsFld: Locator;
  readonly sortVariantList: Locator;

  constructor(page: Page) {
    super(page);

    this.resultsContainer = page.locator('.journey-list__cards[data-tag="journey-list-cards"]');
    this.resultCards = this.resultsContainer.locator('div[data-tag="connection-card"]');
    this.sortResultsFld = page.locator('ui-dropdown journey-list__sort-dropdown');
    this.sortVariantList = page.locator('ui-dropdown__list-wrapper'); // a list to select other sort variant from
  }

  async waitForResults(areSearchResults: boolean = true) {
    if (areSearchResults === true) {
      await expect(this.resultCards.first()).toBeVisible();
    } else {
      // Case: empty search results are expected
      const count = await this.resultCards.count();
      expect(count).toBe(0);
    }
  }

  async getResultCount(): Promise<number> {
    return this.resultCards.count();
  }

  async selectFirstResult() {
    await this.resultCards.first().click();
  }

  async applyMorningDepartureFilter(text: string) {
    await this.getFilteringOption(text)
  }

  async sortByLowestPrice(text: string): Promise<Locator> {
    await this.sortResultsFld.click();
    return await this.getSortOption(text);
  }

  async getSortOption(text: string): Promise<Locator> {
    const sortOption = this.sortVariantList.locator(
      'div.ui-option__label ui-option__label--shorten',
      { hasText: text }
    );
    return sortOption;
  }

  async getFilteringOption(text: string): Promise<Locator> {
    const filteringOption = this.page.locator('label.ui-checkbox', { hasText: text }).locator('input.ui-checkbox__input');
    return filteringOption;
  }

  /*
   * Get price locator for passed result card item locator
   */
  async getPriceLoc(loc: Locator): Promise<Locator> {
    const resultCardPrice = loc.locator('button[data-tag="footer-price-button"] .journey-card__footer-price-total span');
    return resultCardPrice;
  }
}
