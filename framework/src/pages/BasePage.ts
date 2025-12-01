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

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async acceptCookiesIfVisible() {
    const buttons = this.page.getByRole('button', { name: /accept all|accept|agree/i });
    const count = await buttons.count();
    if (count > 0) {
      await buttons.first().click();
    }
  }
}
