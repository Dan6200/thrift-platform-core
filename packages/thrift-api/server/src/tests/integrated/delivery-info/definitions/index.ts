import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'
import {
  DeliveryInfoRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
  DeliveryInfoSchemaID,
} from '#src/app-schema/delivery-info.js'
import { DeliveryInfoId, DeliveryInfo } from '#src/types/delivery-info.js'

export const isValidDeliveryInfoId = (
  data: unknown,
): data is DeliveryInfoId => {
  const { error } = DeliveryInfoSchemaID.validate(data)
  error && console.error(error)
  return !error
}

export const isValidDeliveryInfoRequest = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoRequestSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidDeliveryInfoResponseList = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoResponseListSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidDeliveryInfoResponse = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

const { CREATED, OK, NOT_FOUND } = StatusCodes

const testCreateDelivery = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: isValidDeliveryInfoRequest,
  validateTestResData: isValidDeliveryInfoId,
})

const testGetAllDelivery = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidDeliveryInfoResponseList,
})

const testGetDelivery = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidDeliveryInfoResponse,
})

const testUpdateDelivery = (testRequest as TestRequestWithBody)({
  statusCode: OK,
  verb: 'put',
  validateTestReqData: isValidDeliveryInfoRequest,
  validateTestResData: isValidDeliveryInfoId,
})

const testDeleteDelivery = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'delete',
  validateTestResData: isValidDeliveryInfoId,
})

const testGetNonExistentDelivery = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})

export {
  testCreateDelivery,
  testGetAllDelivery,
  testGetDelivery,
  testUpdateDelivery,
  testDeleteDelivery,
  testGetNonExistentDelivery,
}

