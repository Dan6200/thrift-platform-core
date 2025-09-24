/* This function is a factory for creating test request executors,
 *  allowing initial test parameters to be set up once and reused for multiple specific requests. */

import { StatusCodes } from 'http-status-codes'

export type RequestForTests = {
  params?: { [k: string]: any }
  query?: { [k: string]: any }
  body?: any | any[]
}

export type TestRequestParams = {
  verb: 'get' | 'post' | 'delete' | 'put' | 'patch'
  statusCode: StatusCodes
  validateTestReqData?: (req: RequestForTests) => boolean
  validateTestResData?: (data: unknown) => boolean
}

export type TestRequest = (
  testRequestParams: TestRequestParams,
) => TestRequestOuter

export type TestRequestWithQParamsAndBody = (
  testRequestParams: TestRequestParams & {
    validateTestReqData: (data: unknown) => boolean
  },
) => TestRequestOuterWQueryNBody

export type TestRequestWithQParams = (
  testRequestParams: TestRequestParams,
) => TestRequestOuterWQuery

export type TestRequestWithBody = (
  testRequestParams: TestRequestParams & {
    validateTestReqData: (data: unknown) => boolean
  },
) => TestRequestOuterWBody

type TestRequestOuterWBody = (requestParams: RequestParams) => Promise<any>

type TestRequestOuterWQuery = (requestParams: RequestParams) => Promise<any>

type TestRequestOuterWQueryNBody = (
  requestParams: RequestParams,
) => Promise<any>

type TestRequestOuter = (requestParams: RequestParams) => Promise<any>

export type RequestParams = {
  params?: { [k: string]: any }
  query?: { [k: string]: any }
  body?: any | any[]
  token: string
}
