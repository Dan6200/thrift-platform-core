import {
  addItemToCartSchema,
  cartResponseSchema,
  cartItemsSchema,
  updateCartItemSchema,
} from '../../../app-schema/cart.js'
import {
  CartItemRequestData,
  CartItem,
  CartResponseData,
} from '../../../../types/cart.js'

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
