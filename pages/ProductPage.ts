import { expect, type Locator, type Page } from '@playwright/test';

export interface Product {
  name:  string;
  price: number;
}

export class ProductPage {
  readonly page: Page;
  private readonly productCards: Locator;
  private readonly cartButton:   Locator;

  constructor(page: Page) {
    this.page         = page;
    this.productCards = page.locator('.text-center.col-4');
    this.cartButton   = page.locator('button[onclick="goToCart()"]');
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.productCards.first()).toBeVisible();
  }

  async getAllProducts(): Promise<Product[]> {
    const count    = await this.productCards.count();
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      const card       = this.productCards.nth(i);
      const nameText   = await card.locator('.font-weight-bold').textContent();
      const priceText  = await card.locator('p').filter({ hasText: /Price:/i }).textContent();
      const priceMatch = priceText?.match(/\d+/);

      if (nameText && priceMatch) {
        products.push({
          name:  nameText.trim(),
          price: parseInt(priceMatch[0], 10),
        });
      }
    }

    return products;
  }

  async getCheapestProductByKeyword(keyword: string): Promise<Product> {
    const all      = await this.getAllProducts();
    const filtered = all.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));

    if (filtered.length === 0) {
      throw new Error(`No product found containing: "${keyword}"`);
    }

    return filtered.reduce((min, p) => (p.price < min.price ? p : min));
  }

  async addProductToCart(productName: string): Promise<void> {
    const count = await this.productCards.count();

    for (let i = 0; i < count; i++) {
      const card     = this.productCards.nth(i);
      const nameText = await card.locator('.font-weight-bold').textContent();

      if (nameText?.trim() === productName) {
        await card.locator('button').click();
        return;
      }
    }

    throw new Error(`Product not found: "${productName}"`);
  }

  async addCheapestProductByKeyword(keyword: string): Promise<Product> {
    const product = await this.getCheapestProductByKeyword(keyword);
    await this.addProductToCart(product.name);
    return product;
  }

  async navigateToCart(): Promise<void> {
    await this.cartButton.click();
    await this.page.waitForURL('**/cart');
  }
}
