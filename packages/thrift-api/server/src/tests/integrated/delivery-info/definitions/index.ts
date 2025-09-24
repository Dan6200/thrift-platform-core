import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequest, RequestParams } from '../../test-request/types.js'
import {
  DeliveryInfoCreateRequestSchema,
  DeliveryInfoGetRequestSchema,
  DeliveryInfoUpdateRequestSchema,
  DeliveryInfoDeleteRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
  DeliveryInfoSchemaID,
} from '#src/app-schema/delivery-info.js'
import { validateTestData } from '../../helpers/test-validators.js'

const { CREATED, OK, NOT_FOUND, NO_CONTENT } = StatusCodes

const deliveryPathBase = '/v1/delivery-info'
const buildDeliveryInfoPath = (deliveryInfoId: number) =>
  `${deliveryPathBase}/${deliveryInfoId}`

export const testCreateDelivery = (args: { token: string; body: any }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: deliveryPathBase,
    validateTestReqData: (data) =>
      validateTestData(
        DeliveryInfoCreateRequestSchema,
        data,
        'Delivery Info Create Request Validation Error',
      ),
    validateTestResData: (data) =>
      validateTestData(DeliveryInfoSchemaID, data, 'Delivery Info ID Validation Error'),
  })({
    ...requestParams,
  })
}

export const testGetAllDelivery = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path: deliveryPathBase,
    validateTestReqData: (data) =>
      validateTestData(
        DeliveryInfoGetRequestSchema,
        data,
        'Delivery Info Get All Request Validation Error',
      ),
    validateTestResData: (data) =>
      validateTestData(
        DeliveryInfoResponseListSchema,
        data,
        'Delivery Info Response List Validation Error',
      ),
  })({
    ...requestParams,
  })
}

export const testGetDelivery = (args: {
  token: string
  params: { deliveryInfoId: number }
}) => {
  const path = buildDeliveryInfoPath(args.params.deliveryInfoId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestReqData: (data) =>
      validateTestData(
        DeliveryInfoGetRequestSchema,
        data,
        'Delivery Info Get Request Validation Error',
      ),
    validateTestResData: (data) =>
      validateTestData(
        DeliveryInfoResponseSchema,
        data,
        'Delivery Info Response Validation Error',
      ),
  })({
    ...requestParams,
  })
}

export const testUpdateDelivery = (args: {
  token: string
  params: { deliveryInfoId: number }
  body: any
}) => {
  const path = buildDeliveryInfoPath(args.params.deliveryInfoId)
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'patch',
    path,
    validateTestReqData: (data) =>
      validateTestData(
        DeliveryInfoUpdateRequestSchema,
        data,
        'Delivery Info Update Request Validation Error',
      ),
    validateTestResData: (data) =>
      validateTestData(DeliveryInfoSchemaID, data, 'Delivery Info ID Validation Error'),
  })({
    ...requestParams,
  })
}

export const testDeleteDelivery = (args: {
  token: string
  params: { deliveryInfoId: number }
}) => {
  const path = buildDeliveryInfoPath(args.params.deliveryInfoId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    statusCode: NO_CONTENT,
    verb: 'delete',
    path,
    validateTestReqData: (data) =>
      validateTestData(
        DeliveryInfoDeleteRequestSchema,
        data,
        'Delivery Info Delete Request Validation Error',
      ),
    validateTestResData: null,
  })({
    ...requestParams,
  })
}

export const testGetNonExistentDelivery = (args: {
  token: string
  params: { deliveryInfoId: number }
}) => {
  const path = buildDeliveryInfoPath(args.params.deliveryInfoId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: NOT_FOUND,
    path,
    validateTestReqData: (data) =>
      validateTestData(
        DeliveryInfoGetRequestSchema,
        data,
        'Delivery Info Get Request Validation Error',
      ),
    validateTestResData: null,
  })({
    ...requestParams,
  })
}