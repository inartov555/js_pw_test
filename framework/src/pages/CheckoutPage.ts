import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the checkout page.
 * **Important:** avoid to click Pay Now (real money will be paid)
 */
export class CheckoutPage extends BasePage {
  readonly passengerForm: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly emailConfirm: Locator;

  constructor(page: Page) {
    super(page);

    this.passengerForm = page.locator('[data-testid="passenger-form"], form').first();
    this.firstName = page.locator('input[data-tag="passenger-first-name"]');
    this.lastName = page.locator('input[data-tag="passenger-last-name"]');
    this.email = page.locator('input[data-tag="contact-email"]');
    this.emailConfirm = page.locator('input[data-tag="contact-confirm-email"]');
  }

  async waitForLoaded() {
    await expect(this.passengerForm).toBeVisible();
    await expect(this.firstName).toBeVisible();
    await expect(this.lastName).toBeVisible();
    await expect(this.email).toBeVisible();
    await expect(this.emailConfirm).toBeVisible();
  }

  async assertOnCheckout() {
    await this.waitForLoaded();
  }
}
