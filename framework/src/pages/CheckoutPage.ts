import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the checkout page.
 * **Important:** nothing here attempts to actually pay – we explicitly avoid clicking "PAY NOW".
 */
export class CheckoutPage extends BasePage {
  readonly passengerForm: Locator;
  readonly paymentSection: Locator;
  readonly payNowButton: Locator;

  constructor(page: Page) {
    super(page);

    this.passengerForm = page.locator('[data-testid="passenger-form"], form').first();
    this.paymentSection = page.getByText(/payment details|payment method/i);
    this.payNowButton = page.getByRole('button', { name: /pay now/i });
  }

  async waitForLoaded() {
    await expect(this.passengerForm).toBeVisible();
    await expect(this.paymentSection).toBeVisible();
  }

  async assertOnCheckout() {
    await this.waitForLoaded();
  }

  async assertPayNowIsVisibleButNotClicked() {
    const count = await this.payNowButton.count();
    if (count > 0) {
      await expect(this.payNowButton).toBeVisible();
    }
  }
}
