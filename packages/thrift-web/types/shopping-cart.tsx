import { Product, ProductVariant } from '@/types/products'

export type Item = {
  product: Product & Partial<ProductVariant>
  count: number
}

export class ShoppingCart {
  cartItems: Item[] = new Array()
  constructor(
    product: Product | null,
    shoppingCart: ShoppingCart | null,
    quantity: number = 1,
  ) {
    if (product) {
      const item = {
        product,
        count: quantity,
      }
      this.cartItems.push(item)
    } else if (shoppingCart) {
      this.cartItems = new Array(...shoppingCart.cartItems)
    }
  }
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.cartItems.find(
      (item) =>
        item.product.product_id === product.product_id &&
        item.product.variant_id === product.variant_id,
    )
    if (existingItem) {
      existingItem.count += quantity
    } else {
      this.cartItems.push({ product, count: quantity })
    }
    return true
  }
  removeItem(product: Product) {
    const oldLength = this.cartItems.length
    this.cartItems = this.cartItems.filter(
      (item) =>
        !(
          item.product.product_id === product.product_id &&
          item.product.variant_id === product.variant_id
        ),
    )
    return oldLength >= this.cartItems.length
  }
  increaseCount(index: number) {
    return index >= 0 || index < this.cartItems.length
      ? this.cartItems[index].count++
      : false
  }
  decreaseCount(index: number) {
    return index >= 0 &&
      index < this.cartItems.length &&
      this.cartItems[index].count > 1
      ? this.cartItems[index].count--
      : false
  }
}
