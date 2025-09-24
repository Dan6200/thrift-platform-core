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
  path: string
  statusCode: StatusCodes
  validateTestReqData?: (req: RequestForTests) => boolean
  validateTestResData?: (data: unknown) => boolean
}

export type TestRequest = (
  testRequestParams: TestRequestParams,
) => TestRequestOuter

type TestRequestOuter = (requestParams: RequestParams) => Promise<any>

export type RequestParams = {
  params?: { [k: string]: any }
  query?: { [k: string]: any }
  body?: any | any[]
  token?: string
}
