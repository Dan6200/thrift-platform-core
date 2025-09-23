import { StatusCodes } from 'http-status-codes'
import testRequest from '#src/tests/integrated/test-request/index.js'
import {
  TestRequestWithBody,
  TestRequest,
  TestRequestWithQParamsAndBody,
} from '#src/tests/integrated/test-request/types.js'
import {
  isValidOrderCreateRequest,
  isValidOrderResponse,
  isValidOrderId,
  isValidOrderGETAllResponse,
  isValidOrderQuery,
} from '#src/tests/integrated/helpers/type-guards/orders.js'

const { CREATED, OK, NO_CONTENT, NOT_FOUND } = StatusCodes

export const testCreateOrder = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: isValidOrderCreateRequest,
  validateTestResData: isValidOrderId,
})

export const testGetAllOrders = (testRequest as TestRequestWithQParamsAndBody)({
  verb: 'get',
  statusCode: OK,
  validateTestReqData: isValidOrderQuery,
  validateTestResData: isValidOrderGETAllResponse,
})

export const testGetOrder = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: OK,
  validateTestResData: isValidOrderResponse,
})

export const testUpdateOrder = (testRequest as TestRequestWithBody)({
  verb: 'patch',
  statusCode: OK,
  validateTestReqData: isValidOrderCreateRequest, // Assuming partial update uses the same schema for now
  validateTestResData: isValidOrderId,
})

export const testDeleteOrder = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: NO_CONTENT,
  validateTestResData: null,
})

export const testGetNonExistentOrder = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})
