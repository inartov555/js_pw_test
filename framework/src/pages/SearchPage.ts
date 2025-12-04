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
    // Tip text after typing departure / destination point
    this.anOption = page.locator('.ui-autocomplete__list.ui-autocomplete__list--opened');
    this.departureDateInput = page.locator('div.ui-date-picker');
    // These vars are related to calendars
    const calendars = page.locator('.ui-calendar__tiles button.tile:not(.tile--disabled)');
    this.currentMonthDayNumbers = calendars.nth(0).locator('.tile__day');
    this.nextMonthDayNumbers = calendars.nth(1).locator('.tile__day');
    this.allDayNumbers = page.locator('.ui-date-picker-popup .ui-calendar__tiles button.tile:not([disabled]) .tile__day');
    // End of calendars
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
    await this.departureDateInput.click();

    if (passengers !== 1) {
      await this.passengersToggle.click();
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

  /*
   * Type departure / destination point
   * Args:
   *    - text (String): text to type
   *    - toFrom (Locator): To or From field locator
   */
  async typeToFromPoint(text: String, toFromLocator: Locator) {
    await toFromLocator.fill(text);
    await this.selectFirstAvailableOptionDepDest(text);
  }

  /*
   * Select date, tomorrow's date by default
   * Args:
   *    - daysFromToday (Integer): 0 = Today, 1 = Tomorrow, etc.
   */
  async selectDate(daysFromToday: Integer = 1) {
    await this.departureDateInput.click();
    await this.allDayNumbers.nth(dayInt).click();
  }

  /*
   * The tip text to select after typing departure or destination
   */
  async selectFirstAvailableOptionDepDest(text: String) {
    await this.anOption.first().waitFor({ state: 'visible', timeout: 10000 });
    await this.anOption.getByText(text, { exact: false }).click();
  }
}
