import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';
import { Product } from './ProductPage';

export interface PaymentDetails {
  email:      string;
  cardNumber: string;
  expiry:     string;
  cvc:        string;
  zipCode:    string;
}

export class CartPage {
  readonly page: Page;
  private readonly cartTable:     Locator;
  private readonly cartTableRows: Locator;
  private readonly totalElement:  Locator;
  private readonly stripeButton:  Locator;

  constructor(page: Page) {
    this.page          = page;
    this.cartTable     = page.locator('table.table-striped');
    this.cartTableRows = page.locator('table.table-striped tbody tr');
    this.totalElement  = page.locator('#total');
    this.stripeButton  = page.locator('.stripe-button-el button, button:has-text("Pay with Card")').first();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.cartTable).toBeVisible();
    await expect(this.totalElement).toBeVisible();
  }

  async getCartItems(): Promise<Product[]> {
    const count = await this.cartTableRows.count();
    const items: Product[] = [];

    for (let i = 0; i < count; i++) {
      const cells     = this.cartTableRows.nth(i).locator('td');
      const nameText  = await cells.nth(0).textContent();
      const priceText = await cells.nth(1).textContent();

      if (nameText && priceText) {
        items.push({
          name:  nameText.trim(),
          price: parseInt(priceText.trim(), 10),
        });
      }
    }

    return items;
  }

  async getCartTotal(): Promise<number> {
    const text  = await this.totalElement.textContent();
    const match = text?.match(/\d+/);
    if (!match) throw new Error(`Could not parse cart total from: "${text}"`);
    return parseInt(match[0], 10);
  }

  async verifyCartContents(expectedItems: Product[]): Promise<void> {
    const cartItems = await this.getCartItems();

    expect(cartItems.length).toBe(expectedItems.length);

    for (const expected of expectedItems) {
      const found = cartItems.find(
        item => item.name === expected.name && item.price === expected.price
      );
      expect(found, `Expected "${expected.name}" @ Rs. ${expected.price} in cart`).toBeTruthy();
    }

    const expectedTotal  = expectedItems.reduce((sum, item) => sum + item.price, 0);
    const displayedTotal = await this.getCartTotal();
    expect(displayedTotal).toBe(expectedTotal);
  }

  async payWithCard(details: PaymentDetails): Promise<void> {
    await this.stripeButton.click();

    const stripe: FrameLocator = this.page.frameLocator('iframe[name="stripe_checkout_app"]');

    const emailInput = stripe.locator('input[type="email"], #email');
    await expect(emailInput).toBeVisible({ timeout: 30_000 });
    await emailInput.fill(details.email);

    const cardInput = stripe.locator('#card_number, input[placeholder="Card number"]').first();
    await expect(cardInput).toBeVisible({ timeout: 15_000 });
    await cardInput.click();
    await cardInput.pressSequentially(details.cardNumber, { delay: 50 });

    const expiryInput = stripe.locator('#cc-exp, input[placeholder="MM / YY"]').first();
    await expect(expiryInput).toBeVisible({ timeout: 5_000 });
    await expiryInput.fill(details.expiry);

    const cvcInput = stripe.locator('#cc-csc, input[placeholder="CVC"]').first();
    await expect(cvcInput).toBeVisible({ timeout: 5_000 });
    await cvcInput.fill(details.cvc);

    const zipInput = stripe.locator('#billing-zip, input[placeholder="ZIP Code"]').first();
    await expect(zipInput).toBeVisible({ timeout: 10_000 });
    await zipInput.click();
    await zipInput.fill(details.zipCode);

    const submitBtn = stripe.locator('button[type="submit"], .button').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    await this.page.waitForURL('**/confirmation', { timeout: 45_000 });
  }

  async verifyPaymentSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/.*confirmation/);
    await expect(this.page.locator('body')).toContainText(
      /PAYMENT SUCCESS|success|thank you|confirmed/i,
      { timeout: 15_000 }
    );
  }
}
