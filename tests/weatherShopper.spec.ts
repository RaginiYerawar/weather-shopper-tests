import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage, Product } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

const PAYMENT_DETAILS = {
  email: 'test@abc.com',
  cardNumber: '4111 1111 1111 1111',
  expiry: '12/26',
  cvc: '123',
  zipCode: '12345',
};

test.describe('Weather Shopper – End-to-End Purchase Flow', () => {

  test('should buy correct products based on temperature and complete payment', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await homePage.navigate();

    const { destination } = await homePage.navigateBasedOnTemperature();

    if (destination === 'none') {
      test.skip(true, 'Temperature is between 19–34 °C — no purchase required.');
      return;
    }

    await productPage.waitForPageLoad();

    const addedItems: Product[] = [];

    if (destination === 'moisturizer') {
      addedItems.push(await productPage.addCheapestProductByKeyword('Aloe'));
      addedItems.push(await productPage.addCheapestProductByKeyword('Almond'));
    } else {
      addedItems.push(await productPage.addCheapestProductByKeyword('SPF-50'));
      addedItems.push(await productPage.addCheapestProductByKeyword('SPF-30'));
    }

    await productPage.navigateToCart();
    await cartPage.waitForPageLoad();
    await cartPage.verifyCartContents(addedItems);
    await cartPage.payWithCard(PAYMENT_DETAILS);
    await cartPage.verifyPaymentSuccess();
  });

});

test.describe('Weather Shopper – Individual Page Tests', () => {

  test('home page: should display temperature and purchase buttons', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const temperature = await homePage.getTemperature();
    expect(temperature).toBeGreaterThan(0);
    expect(temperature).toBeLessThanOrEqual(50);

    await homePage.verifyPageLoaded();
  });

  test('moisturizer page: should list products with names and prices', async ({ page }) => {
    await page.goto('/moisturizer');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const products = await productPage.getAllProducts();
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('moisturizer page: should identify cheapest Aloe product', async ({ page }) => {
    await page.goto('/moisturizer');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const cheapest = await productPage.getCheapestProductByKeyword('Aloe');

    expect(cheapest.name.toLowerCase()).toContain('aloe');
    expect(cheapest.price).toBeGreaterThan(0);
  });

  test('moisturizer page: should identify cheapest Almond product', async ({ page }) => {
    await page.goto('/moisturizer');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const cheapest = await productPage.getCheapestProductByKeyword('Almond');

    expect(cheapest.name.toLowerCase()).toContain('almond');
    expect(cheapest.price).toBeGreaterThan(0);
  });

  test('sunscreen page: should list products with names and prices', async ({ page }) => {
    await page.goto('/sunscreen');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const products = await productPage.getAllProducts();
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('sunscreen page: should identify cheapest SPF-50 product', async ({ page }) => {
    await page.goto('/sunscreen');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const cheapest = await productPage.getCheapestProductByKeyword('SPF-50');

    expect(cheapest.name.toLowerCase()).toContain('spf-50');
    expect(cheapest.price).toBeGreaterThan(0);
  });

  test('sunscreen page: should identify cheapest SPF-30 product', async ({ page }) => {
    await page.goto('/sunscreen');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const cheapest = await productPage.getCheapestProductByKeyword('SPF-30');

    expect(cheapest.name.toLowerCase()).toContain('spf-30');
    expect(cheapest.price).toBeGreaterThan(0);
  });

  test('cart page: should be empty on fresh load', async ({ page }) => {
    await page.goto('/cart');
    const cartPage = new CartPage(page);
    await cartPage.waitForPageLoad();

    const items = await cartPage.getCartItems();
    expect(items.length).toBe(0);

    const total = await cartPage.getCartTotal();
    expect(total).toBe(0);
  });

  test('moisturizer flow: should add two items and verify cart', async ({ page }) => {
    await page.goto('/moisturizer');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const aloe = await productPage.addCheapestProductByKeyword('Aloe');
    const almond = await productPage.addCheapestProductByKeyword('Almond');

    await productPage.navigateToCart();

    const cartPage = new CartPage(page);
    await cartPage.waitForPageLoad();
    await cartPage.verifyCartContents([aloe, almond]);
  });

  test('sunscreen flow: should add two items and verify cart', async ({ page }) => {
    await page.goto('/sunscreen');
    const productPage = new ProductPage(page);
    await productPage.waitForPageLoad();

    const spf50 = await productPage.addCheapestProductByKeyword('SPF-50');
    const spf30 = await productPage.addCheapestProductByKeyword('SPF-30');

    await productPage.navigateToCart();

    const cartPage = new CartPage(page);
    await cartPage.waitForPageLoad();
    await cartPage.verifyCartContents([spf50, spf30]);
  });

});
