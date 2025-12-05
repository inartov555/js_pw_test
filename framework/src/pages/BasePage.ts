import { Page, Locator } from '@playwright/test';

/**
 * Base page that other page objects extend from.
 * Encapsulates common helpers (navigation, cookie banners, etc.).
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/', confirmCookies: boolean = true) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async acceptCookiesIfVisible() {
    const button = this.page.locator('button[data-tag="cookies-consent-apply"]');
    try {
      await button.first().waitFor({ state: 'visible', timeout: 7000 });
      await button.first().click();
    } catch {
      // No actions to be done here
    }
  }
}
