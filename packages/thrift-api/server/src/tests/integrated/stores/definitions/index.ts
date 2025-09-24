import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequest, TestRequestWithBody, RequestParams } from '../../test-request/types.js'
import {
  isValidStoreDataId,
  isValidStoreCreateRequest,
  isValidStoreGetAllRequest,
  isValidStoreGetRequest,
  isValidStoreUpdateRequest,
  isValidStoreDeleteRequest,
  isValidStoreDataResponse,
  isValidStoreDataResponseList,
} from '../../helpers/type-guards/store-data.js'

const { CREATED, OK, NOT_FOUND, UNAUTHORIZED, NO_CONTENT } = StatusCodes

const storePathBase = '/v1/stores'
const buildStorePath = (storeId: number) => `${storePathBase}/${storeId}`

export const testCreateStore = (args: {
  token: string
  body: any
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    query: {},
    params: {},
  }
  return (testRequest as TestRequestWithBody)({
    verb: 'post',
    statusCode: CREATED,
    path: storePathBase,
    validateTestReqData: isValidStoreCreateRequest,
    validateTestResData: isValidStoreDataId,
  })(requestParams)
}

export const testGetAllStores = (args: {
  token: string
  query?: { vendor_id?: string }
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    query: args.query || {},
    body: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path: storePathBase,
    validateTestReqData: isValidStoreGetAllRequest,
    validateTestResData: isValidStoreDataResponseList,
  })(requestParams)
}

export const testGetStore = (args: {
  token: string
  params: { storeId: number }
  query?: { vendor_id?: string }
}) => {
  const path = buildStorePath(args.params.storeId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    query: args.query || {},
    body: {},
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestReqData: isValidStoreGetRequest,
    validateTestResData: isValidStoreDataResponse,
  })(requestParams)
}

export const testUpdateStore = (args: {
  token: string
  params: { storeId: number }
  body: any
}) => {
  const path = buildStorePath(args.params.storeId)
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
    query: {},
  }
  return (testRequest as TestRequestWithBody)({
    statusCode: OK,
    verb: 'put',
    path,
    validateTestReqData: isValidStoreUpdateRequest,
    validateTestResData: isValidStoreDataId,
  })(requestParams)
}

export const testDeleteStore = (args: {
  token: string
  params: { storeId: number }
}) => {
  const path = buildStorePath(args.params.storeId)
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
    validateTestReqData: isValidStoreDeleteRequest,
    validateTestResData: null,
  })(requestParams)
}

export const testGetNonExistentStore = (args: {
  token: string
  params: { storeId: number }
}) => {
  const path = buildStorePath(args.params.storeId)
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
  })(requestParams)
}

export const testCreateStoreWithoutVendorAccount = (args: {
  token: string
  body: any
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    query: {},
    params: {},
  }
  return (testRequest as TestRequestWithBody)({
    verb: 'post',
    statusCode: UNAUTHORIZED,
    path: storePathBase,
    validateTestReqData: isValidStoreCreateRequest,
  })(requestParams)
}

export const testUpdateStoreWithoutVendorAccount = (args: {
  token: string
  params: { storeId: number }
  body: any
}) => {
  const path = buildStorePath(args.params.storeId)
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
    query: {},
  }
  return (testRequest as TestRequestWithBody)({
    statusCode: UNAUTHORIZED,
    verb: 'put',
    path,
    validateTestReqData: isValidStoreUpdateRequest,
  })(requestParams)
}

export const testDeleteStoreWithoutVendorAccount = (args: {
  token: string
  params: { storeId: number }
}) => {
  const path = buildStorePath(args.params.storeId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: {},
    query: {},
  }
  return (testRequest as TestRequest)({
    statusCode: UNAUTHORIZED,
    verb: 'delete',
    path,
    validateTestReqData: isValidStoreDeleteRequest,
  })(requestParams)
}
