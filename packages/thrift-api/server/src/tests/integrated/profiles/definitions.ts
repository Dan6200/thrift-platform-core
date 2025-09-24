import chai from 'chai'
import chaiHttp from 'chai-http'
import { StatusCodes } from 'http-status-codes'
import { TestRequest, RequestParams } from '../test-request/types.js'
import { isValidProfileResponseData } from '../helpers/type-guards/profile.js'
import testRequest from '../test-request/index.js'
import { ProfileResponseSchema } from '#src/app-schema/profiles.js'
import { validateTestData } from '../helpers/test-validators.js'
import { ProfileData } from '#src/types/profile/index.js'

chai.use(chaiHttp).should()

const { OK, UNAUTHORIZED } = StatusCodes

const profilePath = '/v1/me'

const hasCustomerAccount = (data: unknown) => {
  validateTestData(
    ProfileResponseSchema,
    data,
    'User Profile Response Validation Error',
  ),
    (data as ProfileData).is_customer.should.be.true
  return true
}

const hasVendorAccount = (data: unknown) => {
  validateTestData(
    ProfileResponseSchema,
    data,
    'User Profile Response Validation Error',
  ),
    (data as ProfileData).is_vendor.should.be.true
  return true
}

const hasNoVendorAccount = (data: unknown) => {
  validateTestData(
    ProfileResponseSchema,
    data,
    'User Profile Response Validation Error',
  ),
    (data as ProfileData).is_vendor.should.be.false
  return true
}

export const testGetProfile = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
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
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasCustomerAccount,
  })(requestParams)
}

export const testHasVendorAccount = (args: { token: string }) => {
  const requestParams: RequestParams = {
    token: args.token,
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
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasNoVendorAccount,
  })(requestParams)
}

export const testGetProfileWithoutSignIn = () => {
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: UNAUTHORIZED,
    path: profilePath,
  })({})
}

export const testHasCustomerAccountWithoutSignIn = () => {
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: hasCustomerAccount,
  })({})
}

