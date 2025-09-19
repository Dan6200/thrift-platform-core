import {
  addItemToCartSchema,
  cartResponseSchema,
  cartItemsSchema,
  updateCartItemSchema,
} from '../app-schema/cart.js'

export interface CartItemRequestData {
  variant_id: number
  quantity: number
}

export interface CartItem {
  item_id: number
  variant_id: number
  quantity: number
  product_title: string
  price: number
  image_url?: string | null
}

export interface CartResponseData {
  cart_id: number
  customer_id: string
  items: CartItem[]
  total_items: number
  total_price: number
}

export const isValidCartUpdateRequest = (
  data: unknown,
): data is CartItemRequestData => {
  const { error } = updateCartItemSchema.validate(data)
  return !error
}

export const isValidCartAddItemRequest = (
  data: unknown,
): data is CartItemRequestData => {
  const { error } = addItemToCartSchema.validate(data)
  return !error
}

export const isValidCartResponse = (
  data: unknown,
): data is CartResponseData[] => {
  const { error } = cartResponseSchema.validate(data)
  return !error
}

export const isValidCartItems = (data: unknown): data is CartItem[] => {
  const { error } = cartItemsSchema.validate(data)
  return !error
}
