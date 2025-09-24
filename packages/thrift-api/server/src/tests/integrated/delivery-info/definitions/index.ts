import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import {
  TestRequestWithBody,
  TestRequest,
  RequestParams,
} from '../../test-request/types.js'
import {
  isValidDeliveryInfoId,
  isValidDeliveryInfoCreateRequest,
  isValidDeliveryInfoGetRequest,
  isValidDeliveryInfoUpdateRequest,
  isValidDeliveryInfoDeleteRequest,
  isValidDeliveryInfoResponseList,
  isValidDeliveryInfoResponse,
} from '../../helpers/type-guards/delivery-info.js'

const { CREATED, OK, NOT_FOUND, NO_CONTENT } = StatusCodes

const deliveryPathBase = '/v1/delivery-info'
const buildDeliveryInfoPath = (deliveryInfoId: number) =>
  `${deliveryPathBase}/${deliveryInfoId}`

export const testCreateDelivery = (args: { token: string; body: any }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    query: {},
    params: {},
  }
  return (testRequest as TestRequestWithBody)({
    verb: 'post',
    statusCode: CREATED,
    path: deliveryPathBase,
    validateTestReqData: isValidDeliveryInfoCreateRequest,
    validateTestResData: isValidDeliveryInfoResponse,
  })({
    ...requestParams,
  })
}

export const testGetAllDelivery = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path: deliveryPathBase,
    validateTestResData: isValidDeliveryInfoResponseList,
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
    body: {},
    query: {},
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestReqData: isValidDeliveryInfoGetRequest,
    validateTestResData: isValidDeliveryInfoResponse,
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
    query: {},
  }
  return (testRequest as TestRequestWithBody)({
    statusCode: OK,
    verb: 'patch',
    path,
    validateTestReqData: isValidDeliveryInfoUpdateRequest,
    validateTestResData: isValidDeliveryInfoResponse,
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
    body: {},
    query: {},
  }
  return (testRequest as TestRequest)({
    statusCode: NO_CONTENT,
    verb: 'delete',
    path,
    validateTestReqData: isValidDeliveryInfoDeleteRequest,
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
    body: {},
    query: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: NOT_FOUND,
    path,
    validateTestResData: null,
  })({
    ...requestParams,
  })
}

