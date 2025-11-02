import { StatusCodes } from 'http-status-codes'
import testRequest from '#src/tests/integrated/test-request/index.js'
import {
  TestRequest,
  RequestParams,
} from '#src/tests/integrated/test-request/types.js'
import {
  isValidOrderCreateRequest,
  isValidOrderResponse,
  isValidOrderId,
  isValidOrderGETAllResponse,
  isValidOrderQuery,
} from '#src/tests/integrated/helpers/type-guards/orders.js'
import { OrderCreateRequestData, OrderResponseData } from '#src/types/orders.js'
import chai from 'chai'
import * as JDP from 'jsondiffpatch'
import * as consoleFormatter from 'jsondiffpatch/formatters/console'

const jdp = JDP.create()

const { CREATED, OK, NO_CONTENT, NOT_FOUND } = StatusCodes

const ordersPathBase = '/v1/orders'
const buildOrderPath = (orderId: number) => `${ordersPathBase}/${orderId}`

const compareOrderData = (actual: any, expected: any) => {
  const actualOrder = actual as OrderResponseData

  try {
    actualOrder.store_id.should.equal(expected.store_id)
    actualOrder.total_amount.should.equal(expected.total_amount)
    actualOrder.items.length.should.equal(expected.items.length)

    // Sort items by variant_id for consistent comparison
    const sortedActualItems = [...actualOrder.items].sort(
      (a, b) => a.variant_id - b.variant_id,
    )
    const sortedExpectedItems = [...expected.items].sort(
      (a, b) => a.variant_id - b.variant_id,
    )

    for (let i = 0; i < sortedExpectedItems.length; i++) {
      const actualItem = sortedActualItems[i]
      const expectedItem = sortedExpectedItems[i]
      actualItem.variant_id.should.equal(expectedItem.variant_id)
      actualItem.quantity.should.equal(expectedItem.quantity)
    }
  } catch (assertionError) {
    const delta = jdp.diff(expected, actual)
    if (delta) {
      console.log('Order data comparison failed. Delta:')
      consoleFormatter.log(delta)
    }
    throw assertionError
  }

  return true
}

export const testCreateOrder = (args: {
  token: string
  body: OrderCreateRequestData
  expectedData: any
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: ordersPathBase,
    validateTestReqData: isValidOrderCreateRequest,
    validateTestResData: isValidOrderResponse,
    compareData: (actual, expected) => compareOrderData(actual, expected),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testGetAllOrders = (args: {
  token: string
  query: { store_id: number }
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: ordersPathBase,
    validateTestReqData: isValidOrderQuery,
    validateTestResData: isValidOrderGETAllResponse,
  })(requestParams)
}

export const testGetOrder = (args: {
  token: string
  params: { orderId: number }
}) => {
  const path = buildOrderPath(args.params.orderId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path,
    validateTestResData: isValidOrderResponse,
  })(requestParams)
}

export const testUpdateOrder = (args: {
  token: string
  params: { orderId: number }
  body: OrderCreateRequestData
  expectedData: any
}) => {
  const path = buildOrderPath(args.params.orderId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'patch',
    statusCode: OK,
    path,
    validateTestReqData: isValidOrderCreateRequest, // Assuming partial update uses the same schema for now
    validateTestResData: isValidOrderResponse,
    compareData: (actual, expected) => compareOrderData(actual, expected),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testDeleteOrder = (args: {
  token: string
  params: { orderId: number }
}) => {
  const path = buildOrderPath(args.params.orderId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'delete',
    statusCode: NO_CONTENT,
    path,
    validateTestResData: null,
  })(requestParams)
}

export const testGetNonExistentOrder = (args: {
  token: string
  params: { orderId: number }
}) => {
  const path = buildOrderPath(args.params.orderId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: NOT_FOUND,
    path,
    validateTestResData: null,
  })(requestParams)
}
