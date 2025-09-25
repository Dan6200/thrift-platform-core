import chai from 'chai'
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
} from '#src/app-schema/stores.js'
import { validateTestData } from '../../helpers/test-validators.js'
import StoreData from '#src/types/store-data.js'

const { CREATED, OK, NOT_FOUND, UNAUTHORIZED, NO_CONTENT } = StatusCodes

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

const compareStoreData = (actual: any, expected: StoreData) => {
  validateStoreDataRes(actual)
  const actualStore = actual as StoreData

  actualStore.store_name.should.equal(expected.store_name)
  actualStore.custom_domain.should.equal(expected.custom_domain)
  actualStore.favicon.should.equal(expected.favicon)

  // Deep comparison for nested objects
  actualStore.store_address.should.deep.equal(expected.store_address)
  // For pages and sections, we'll just check for existence and type for now
  // A more detailed comparison might be needed depending on test requirements
  actualStore.should.have.property('pages').that.is.an('array')

  // Assert that server-generated fields exist and are of the correct type
  actualStore.should.have.property('store_id').that.is.a('number')
  actualStore.should.have.property('vendor_id').that.is.a('string')
  actualStore.should.have.property('created_at').that.is.a('string')
  actualStore.should.have.property('updated_at').that.is.a('string')

  // Check that timestamps are recent (within the last 5 seconds)
  const now = new Date()
  const createdAt = new Date(actualStore.created_at!)
  const updatedAt = new Date(actualStore.updated_at!)
  const fiveSeconds = 5000 // 5000 milliseconds

  chai.expect(now.getTime() - createdAt.getTime()).to.be.lessThan(fiveSeconds)
  chai.expect(now.getTime() - updatedAt.getTime()).to.be.lessThan(fiveSeconds)

  return true
}

export const testCreateStore = (args: { token: string; body: any; expectedData: StoreData }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: storePathBase,
    validateTestReqData: validateStoreCreateReq,
    validateTestResData: validateStoreDataRes,
    compareData: (actual, expected) => compareStoreData(actual, expected as StoreData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testGetAllStores = (args: {
  token: string
  query?: { vendor_id?: string }
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    query: args.query || {},
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
  expectedData: StoreData
}) => {
  const path = buildStorePath(args.params.storeId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    query: args.query || {},
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestReqData: validateStoreGetReq,
    validateTestResData: validateStoreDataRes,
    compareData: (actual, expected) => compareStoreData(actual, expected as StoreData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testUpdateStore = (args: {
  token: string
  params: { storeId: number }
  body: any
  expectedData: StoreData
}) => {
  const path = buildStorePath(args.params.storeId)
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'patch',
    path,
    validateTestReqData: validateStoreUpdateReq,
    validateTestResData: validateStoreDataRes,
    compareData: (actual, expected) => compareStoreData(actual, expected as StoreData),
    expectedData: args.expectedData,
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
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: UNAUTHORIZED,
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
  }
  return (testRequest as TestRequest)({
    statusCode: UNAUTHORIZED,
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
  }
  return (testRequest as TestRequest)({
    statusCode: UNAUTHORIZED,
    verb: 'delete',
    path,
    validateTestReqData: validateStoreDeleteReq,
  })(requestParams)
}