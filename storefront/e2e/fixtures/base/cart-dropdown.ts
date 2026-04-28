import { Locator, Page } from "@playwright/test"

export class CartDropdown {
  page: Page
  navCartLink: Locator
  cartDropdown: Locator
  cartSubtotal: Locator
  goToCartButton: Locator

  constructor(page: Page) {
    this.page = page
    this.navCartLink = page.getByTestId("nav-cart-link")
    this.cartDropdown = page.getByTestId("nav-cart-dropdown")
    this.cartSubtotal = this.cartDropdown.getByTestId("cart-subtotal")
    this.goToCartButton = this.cartDropdown.getByTestId("go-to-cart-button")
  }

  async displayCart() {
    await this.navCartLink.click()
  }

  async close() {
    if (await this.cartDropdown.isVisible()) {
      await this.page.keyboard.press("Escape")
    }
  }

  async getCartItem(name: string, variant: string) {
    const cartItem = this.cartDropdown
      .getByTestId("cart-item")
      .filter({
        hasText: name,
      })
      .filter({
        hasText: `Variant: ${variant}`,
      })
    return {
      locator: cartItem,
      productLink: cartItem.getByTestId("product-link"),
      removeButton: cartItem.getByTestId("cart-item-remove-button"),
      name,
      quantity: cartItem.getByTestId("cart-item-quantity"),
      variant: cartItem.getByTestId("cart-item-variant"),
    }
  }
}
