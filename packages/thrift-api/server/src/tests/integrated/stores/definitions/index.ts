import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequest, RequestParams } from '../../test-request/types.js'
import {
  StoreCreateRequestSchema,
  StoreGetAllRequestSchema,
  StoreGetRequestSchema,
  StoreUpdateRequestSchema,
  StoreDeleteRequestSchema,
  StoreDataResponseListSchema,
  StoreDataResponseSchema,
  StoreIDSchema,
} from '#src/app-schema/stores.js'
import { validateTestData } from '../../helpers/test-validators.js'

const { CREATED, OK, NOT_FOUND, FORBIDDEN, NO_CONTENT } = StatusCodes

const storePathBase = '/v1/stores'
const buildStorePath = (storeId: number) => `${storePathBase}/${storeId}`

// Request Validators
const validateStoreCreateReq = (data: unknown) =>
  validateTestData(
    StoreCreateRequestSchema,
    data,
    'Store Create Request Validation Error',
  )
const validateStoreGetAllReq = (data: unknown) =>
  validateTestData(
    StoreGetAllRequestSchema,
    data,
    'Store Get All Request Validation Error',
  )
const validateStoreGetReq = (data: unknown) =>
  validateTestData(
    StoreGetRequestSchema,
    data,
    'Store Get Request Validation Error',
  )
const validateStoreUpdateReq = (data: unknown) =>
  validateTestData(
    StoreUpdateRequestSchema,
    data,
    'Store Update Request Validation Error',
  )
const validateStoreDeleteReq = (data: unknown) =>
  validateTestData(
    StoreDeleteRequestSchema,
    data,
    'Store Delete Request Validation Error',
  )

// Response Validators
const validateStoreDataListRes = (data: unknown) =>
  validateTestData(
    StoreDataResponseListSchema,
    data,
    'Store Data List Response Validation Error',
  )
const validateStoreDataRes = (data: unknown) =>
  validateTestData(
    StoreDataResponseSchema,
    data,
    'Store Data Response Validation Error',
  )

export const testCreateStore = (args: { token: string; body: any }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: storePathBase,
    validateTestReqData: validateStoreCreateReq,
    validateTestResData: validateStoreDataRes,
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
    validateTestReqData: validateStoreGetAllReq,
    validateTestResData: validateStoreDataListRes,
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
    validateTestReqData: validateStoreGetReq,
    validateTestResData: validateStoreDataRes,
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
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'put',
    path,
    validateTestReqData: validateStoreUpdateReq,
    validateTestResData: validateStoreDataRes,
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
    validateTestReqData: validateStoreDeleteReq,
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
    validateTestReqData: validateStoreGetReq,
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
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: FORBIDDEN,
    path: storePathBase,
    validateTestReqData: validateStoreCreateReq,
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
  return (testRequest as TestRequest)({
    statusCode: FORBIDDEN,
    verb: 'put',
    path,
    validateTestReqData: validateStoreUpdateReq,
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
    statusCode: FORBIDDEN,
    verb: 'delete',
    path,
    validateTestReqData: validateStoreDeleteReq,
  })(requestParams)
}

