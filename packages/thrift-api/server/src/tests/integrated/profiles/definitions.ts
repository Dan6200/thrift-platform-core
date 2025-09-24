import chai from 'chai'
import chaiHttp from 'chai-http'
import { StatusCodes } from 'http-status-codes'
import { TestRequest, RequestParams } from '../test-request/types.js'
import { isValidProfileResponseData } from '../helpers/type-guards/profile.js'
import testRequest from '../test-request/index.js'

chai.use(chaiHttp).should()

const { OK, UNAUTHORIZED } = StatusCodes

const profilePath = '/v1/me'

const hasNoCustomerAccount = (data: unknown) => {
  const isValidData = isValidProfileResponseData(data)
  if (!isValidData) throw new Error('Invalid Profile Data Response')
  data.is_customer.should.be.true
  return true
}

const hasCustomerAccount = (data: unknown) => {
  const isValidData = isValidProfileResponseData(data)
  if (!isValidData) throw new Error('Invalid Profile Data Response')
  data.is_customer.should.be.true
  return true
}

const hasVendorAccount = (data: unknown) => {
  const isValidData = isValidProfileResponseData(data)
  if (!isValidData) throw new Error('Invalid Profile Data Response')
  data.is_customer.should.be.true
  return true
}

const hasNoVendorAccount = (data: unknown) => {
  const isValidData = isValidProfileResponseData(data)
  if (!isValidData) throw new Error('Invalid Profile Data Response')
  data.is_customer.should.be.true
  return true
}

export const testGetProfile = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: isValidProfileResponseData,
  })(requestParams)
}

export const testHasCustomerAccount = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasCustomerAccount,
  })(requestParams)
}

export const testHasNoCustomerAccount = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasNoCustomerAccount,
  })(requestParams)
}

export const testHasVendorAccount = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasVendorAccount,
  })(requestParams)
}

export const testHasNoVendorAccount = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasNoVendorAccount,
  })(requestParams)
}

export const testGetProfileWithoutSignIn = (args: {}) => {
  const requestParams: RequestParams = {
    token: '',
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: UNAUTHORIZED,
    path: profilePath,
  })(requestParams)
}

export const testHasCustomerAccountWithoutSignIn = (args: {}) => {
  const requestParams: RequestParams = {
    token: '',
    body: {},
    query: {},
    params: {},
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasCustomerAccount,
  })(requestParams)
}