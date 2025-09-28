import {
  AddItemToCartRequestSchema,
  UpdateCartItemRequestSchema,
  RemoveCartItemRequestSchema,
  GetCartRequestSchema,
  cartResponseSchema,
  cartItemsSchema,
  cartItemResponseSchema,
} from '#src/app-schema/cart.js'
import { validateTestData } from '../test-validators.js'

export const validateAddItemToCartReq = (data: unknown) =>
  validateTestData(
    AddItemToCartRequestSchema,
    data,
    'Add Item to Cart Request Validation Error',
  )

export const validateUpdateCartItemReq = (data: unknown) =>
  validateTestData(
    UpdateCartItemRequestSchema,
    data,
    'Update Cart Item Request Validation Error',
  )

export const validateRemoveCartItemReq = (data: unknown) =>
  validateTestData(
    RemoveCartItemRequestSchema,
    data,
    'Remove Cart Item Request Validation Error',
  )

export const validateGetCartReq = (data: unknown) =>
  validateTestData(
    GetCartRequestSchema,
    data,
    'Get Cart Request Validation Error',
  )

export const validateCartRes = (data: unknown) =>
  validateTestData(cartResponseSchema, data, 'Cart Response Validation Error')

export const validateCartItemRes = (data: unknown) =>
  validateTestData(
    cartItemResponseSchema,
    data,
    'Cart Item Response Validation Error',
  )
