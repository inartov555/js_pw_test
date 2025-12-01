import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { formatDateOffset } from '../utils/date';

/**
 * Page Object for the search page.
 * Assumptions about labels/roles are based on common white‑label patterns
 * and may need minor tweaks in your environment.
 */
export class SearchPage extends BasePage {
  readonly fromInput: Locator;
  readonly toInput: Locator;
  readonly departureDateInput: Locator;
  readonly searchButton: Locator;
  readonly passengersToggle: Locator;

  constructor(page: Page) {
    super(page);

    this.fromInput = page.getByLabel(/from/i);
    this.toInput = page.getByLabel(/to/i);
    this.departureDateInput = page.getByLabel(/departure date|outbound|date/i);
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.passengersToggle = page.getByRole('button', { name: /passengers|travellers/i });
  }

  async open() {
    await this.goto('/');
    await this.acceptCookiesIfVisible();
  }

  async searchOneWay({
    from,
    to,
    daysFromToday = 7,
    passengers = 1,
  }: {
    from: string;
    to: string;
    daysFromToday?: number;
    passengers?: number;
  }) {
    await this.open();

    await this.fromInput.fill(from);
    await this.toInput.fill(to);

    const dateString = formatDateOffset(daysFromToday);
    await this.departureDateInput.fill(dateString);

    if (passengers !== 1) {
      await this.passengersToggle.click();
      // This assumes +/- controls exist – tweak to match the actual DOM
      const plusButton = this.page.getByRole('button', { name: /\+/ });
      for (let i = 1; i < passengers; i++) {
        await plusButton.click();
      }
    }

    await this.searchButton.click();
  }

  async submitWithMissingDestination() {
    await this.open();
    await this.fromInput.fill('Munich');
    await this.departureDateInput.fill(formatDateOffset(7));
    await this.searchButton.click();
  }

  async expectDestinationValidationError() {
    const error = this.page.getByText(/please select a destination|destination is required/i);
    await expect(error).toBeVisible();
  }
}
