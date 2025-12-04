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
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
    // console.log('[TEST] Starting example test');
    // this.acceptWeUseCookiesOverlay()
  }

  async acceptCookiesIfVisible() {
    const buttons = this.page.getByTestId('cookies-consent-apply');
    const count = await buttons.count();
    if (count > 0) {
      await buttons.first().click();
    }
  }

  async acceptWeUseCookiesOverlay() {
    // The modal wrapper
    const cookiesModal = this.page.locator(
      '[data-tag="cookies-consent-modal"]'
    );
    // console.log("\n\n YO \n\n");

    if (!(await cookiesModal.isVisible())) {
      return;
    }

    // The “Apply” button inside the modal
    const applyButton =
      cookiesModal.getByRole('button', { name: /apply/i }) ||
      this.page.getByRole('button', { name: /apply/i });

    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
  }
}
