import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Search page.
 */
export class SearchPage extends BasePage {
  readonly fromInput: Locator;
  readonly toInput: Locator;
  readonly anOption: Locator;
  readonly departureDateInput: Locator;

  readonly currentMonthDayNumbers: Locator;
  readonly nextMonthDayNumbers: Locator;
  readonly allDayNumbers: Locator;

  readonly searchButton: Locator;
  readonly passengersToggle: Locator;
  readonly passangPlusBtn: Locator;

  readonly fromErr: Locator;
  readonly toErr: Locator;

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
    this.searchButton = page.locator('div.search-form__submit-button cell div button')
    this.passengersToggle = page.locator('div.passenger-dropdown');
    this.passangPlusBtn = page.locator('span.font-icon.font-icon-plus.small').locator('..');
    // Errors
    this.fromErr = page.locator('div[data-tag="departure-wrapper"]');
    this.toErr = page.locator('div[data-tag="arrival-wrapper"]');
  }

  async open() {
    await this.goto('/');
    await this.acceptCookiesIfVisible();
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
  async typeToFromPoint(text: string, toFromLocator: Locator) {
    await toFromLocator.fill(text);
    await this.selectFirstAvailableOptionDepDest(text);
  }

  /*
   * Select date, tomorrow's date by default
   * Args:
   *    - daysFromToday (Integer): 0 = Today, 1 = Tomorrow, etc.
   */
  async selectDate(daysFromToday: number = 1) {
    await this.departureDateInput.click();
    await this.allDayNumbers.nth(daysFromToday).click();
  }

  /*
   * The tip text to select after typing departure or destination
   */
  async selectFirstAvailableOptionDepDest(text: string) {
    await this.anOption.first().waitFor({ state: 'visible', timeout: 10000 });
    await this.anOption.getByText(text, { exact: false }).click();
  }

  /*
   * Args:
   *    - loc (Locator): this.fromErr or this.toErr
   */
  async getErrTextLoc(text: string, loc: Locator) {
    const errMes = loc.locator(
      'div.ui-input-error-message[role="status"]',
      { hasText: text }
    );
    return errMes;
  }

  /*
   * Number of passangers in the input field by the Search button
   * Args:
   *    - text (string): from '1' to '10'
   */
  async getNumOfPassangLoc(text: string) {
    const numOfPassang = this.passengersToggle.locator(
      'div.passenger-dropdown__description',
      { hasText: text }
    );
    return numOfPassang;
  }
}
