import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'
import {
  addItemToCartSchema,
  cartResponseSchema,
  cartItemsSchema,
  updateCartItemSchema,
} from '../../../../app-schema/cart.js'
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

const { CREATED, OK, NO_CONTENT, NOT_FOUND } = StatusCodes

export const testGetCart = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidCartResponse,
})

export const testAddItemToCart = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: isValidCartAddItemRequest,
  validateTestResData: isValidCartItems,
})

export const testUpdateCartItem = (testRequest as TestRequestWithBody)({
  statusCode: OK,
  verb: 'put',
  validateTestReqData: isValidCartUpdateRequest,
  validateTestResData: isValidCartItems,
})

export const testRemoveCartItem = (testRequest as TestRequest)({
  statusCode: NO_CONTENT,
  verb: 'delete',
  validateTestResData: null, // No response body to validate
})

export const testGetNonExistentCart = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})

