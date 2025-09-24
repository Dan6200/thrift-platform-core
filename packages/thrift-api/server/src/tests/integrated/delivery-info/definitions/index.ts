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
} from '#src/app-schema/delivery-info.js'
import { validateTestData } from '../../helpers/test-validators.js'

const { CREATED, OK, NOT_FOUND, NO_CONTENT } = StatusCodes

const deliveryPathBase = '/v1/delivery-info'
const buildDeliveryInfoPath = (deliveryInfoId: number) =>
  `${deliveryPathBase}/${deliveryInfoId}`

// Request Validators
const validateDeliveryInfoCreateReq = (data: unknown) =>
  validateTestData(
    DeliveryInfoCreateRequestSchema,
    data,
    'Delivery Info Create Request Validation Error',
  )
const validateDeliveryInfoGetReq = (data: unknown) =>
  validateTestData(
    DeliveryInfoGetRequestSchema,
    data,
    'Delivery Info Get Request Validation Error',
  )
const validateDeliveryInfoUpdateReq = (data: unknown) =>
  validateTestData(
    DeliveryInfoUpdateRequestSchema,
    data,
    'Delivery Info Update Request Validation Error',
  )
const validateDeliveryInfoDeleteReq = (data: unknown) =>
  validateTestData(
    DeliveryInfoDeleteRequestSchema,
    data,
    'Delivery Info Delete Request Validation Error',
  )

// Response Validators
const validateDeliveryInfoRes = (data: unknown) =>
  validateTestData(
    DeliveryInfoResponseSchema,
    data,
    'Delivery Info Response Validation Error',
  )
const validateDeliveryInfoListRes = (data: unknown) =>
  validateTestData(
    DeliveryInfoResponseListSchema,
    data,
    'Delivery Info Response List Validation Error',
  )

export const testCreateDelivery = (args: { token: string; body: any }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: deliveryPathBase,
    validateTestReqData: validateDeliveryInfoCreateReq,
    validateTestResData: validateDeliveryInfoRes,
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
    validateTestResData: validateDeliveryInfoListRes,
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
    validateTestReqData: validateDeliveryInfoGetReq,
    validateTestResData: validateDeliveryInfoRes,
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
    validateTestReqData: validateDeliveryInfoUpdateReq,
    validateTestResData: validateDeliveryInfoRes,
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
    validateTestReqData: validateDeliveryInfoDeleteReq,
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
    validateTestReqData: validateDeliveryInfoGetReq,
    validateTestResData: null,
  })({
    ...requestParams,
  })
}

