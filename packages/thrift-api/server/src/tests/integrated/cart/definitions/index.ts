import { StatusCodes } from 'http-status-codes'
import {
  isValidCartItemRequest,
  isValidCartResponse,
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
  validateTestReqData: isValidCartItemRequest,
  validateTestResData: isValidCartResponse, // Assuming the response is the whole cart
})

export const testUpdateCartItem = (testRequest as TestRequestWithBody)({
  statusCode: OK,
  verb: 'put',
  validateTestReqData: isValidCartItemRequest,
  validateTestResData: isValidCartResponse, // Assuming the response is the whole cart
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
