import { StatusCodes } from 'http-status-codes'
import {
  isValidCartResponse,
  isValidCartItems,
  isValidCartUpdateRequest,
  isValidCartAddItemRequest,
} from '../../../../types/cart.js'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'

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
