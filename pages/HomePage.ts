import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  private readonly temperatureLocator: Locator;
  private readonly buyMoisturizersBtn: Locator;
  private readonly buySunscreensBtn:   Locator;

  constructor(page: Page) {
    this.page               = page;
    this.temperatureLocator = page.locator('#temperature');
    this.buyMoisturizersBtn = page.getByRole('button', { name: 'Buy moisturizers' });
    this.buySunscreensBtn   = page.getByRole('button', { name: 'Buy sunscreens' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.temperatureLocator).toBeVisible();
  }

  async getTemperature(): Promise<number> {
    const text  = await this.temperatureLocator.textContent();
    const match = text?.match(/\d+/);
    if (!match) {
      throw new Error(`Could not parse temperature from: "${text}"`);
    }
    return parseInt(match[0], 10);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.buyMoisturizersBtn).toBeVisible();
    await expect(this.buySunscreensBtn).toBeVisible();
  }

  async clickBuyMoisturizers(): Promise<void> {
    await this.buyMoisturizersBtn.click();
    await this.page.waitForURL('**/moisturizer');
  }

  async clickBuySunscreens(): Promise<void> {
    await this.buySunscreensBtn.click();
    await this.page.waitForURL('**/sunscreen');
  }

  async navigateBasedOnTemperature(): Promise<{ temperature: number; destination: 'moisturizer' | 'sunscreen' | 'none' }> {
    const temperature = await this.getTemperature();

    if (temperature < 19) {
      await this.clickBuyMoisturizers();
      return { temperature, destination: 'moisturizer' };
    } else if (temperature > 34) {
      await this.clickBuySunscreens();
      return { temperature, destination: 'sunscreen' };
    }

    return { temperature, destination: 'none' };
  }
}
