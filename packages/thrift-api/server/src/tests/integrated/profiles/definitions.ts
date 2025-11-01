import chai from 'chai'
import chaiHttp from 'chai-http'
import { StatusCodes } from 'http-status-codes'
import { TestRequest, RequestParams } from '../test-request/types.js'
import testRequest from '../test-request/index.js'
import { ProfileResponseSchema } from '#src/app-schema/profiles.js'
import { validateTestData } from '../helpers/test-validators.js'
import { ProfileData, ProfileRequestData } from '#src/types/profile/index.js'

chai.use(chaiHttp).should()

const { OK, UNAUTHORIZED } = StatusCodes

const profilePath = '/v1/me'

const validateProfileResponse = (data: unknown) =>
  validateTestData(
    ProfileResponseSchema,
    data,
    'User Profile Response Validation Error',
  )

const compareProfileData = (actual: any, expected: ProfileRequestData) => {
  validateProfileResponse(actual)
  const actualProfile = actual as ProfileData

  actualProfile.first_name.should.equal(expected.first_name)
  actualProfile.last_name.should.equal(expected.last_name)
  actualProfile.email.should.equal(expected.email)

  // DOB comparison: convert expected DOB to ISO string to avoid timezone issues
  const expectedDob = new Date(expected.dob).toISOString()

  actualProfile.dob.should.equal(expectedDob)

  actualProfile.country.should.equal(expected.country)
  actualProfile.is_customer.should.equal(expected.is_customer)
  actualProfile.is_vendor.should.equal(expected.is_vendor)

  // Assert that server-generated fields exist and are of the correct type
  actualProfile.should.have.property('id').that.is.a('string')
  actualProfile.should.have.property('created_at').that.is.a('string')
  actualProfile.should.have.property('updated_at').that.is.a('string')
  actualProfile.should.have.property('deleted_at').that.is.null // Assuming deleted_at is null for active profiles

  // Check that timestamps are recent (within the last 5 seconds)
  const now = new Date()
  const createdAt = new Date(actualProfile.created_at!)
  const updatedAt = new Date(actualProfile.updated_at!)
  const oneSecond = 1000 // 1000 milliseconds

  chai.expect(now.getTime() - createdAt.getTime()).to.be.lessThan(oneSecond)
  chai.expect(now.getTime() - updatedAt.getTime()).to.be.lessThan(oneSecond)

  return true
}

export const testGetProfile = (args: {
  token: string
  expectedData: ProfileRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: validateProfileResponse,
    compareData: (actual, expected) =>
      compareProfileData(actual, expected as ProfileRequestData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testHasCustomerAccount = (args: {
  token: string
  expectedData: ProfileRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: validateProfileResponse,
    compareData: (actual, expected) =>
      compareProfileData(actual, expected as ProfileRequestData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testHasVendorAccount = (args: {
  token: string
  expectedData: ProfileRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: validateProfileResponse,
    compareData: (actual, expected) =>
      compareProfileData(actual, expected as ProfileRequestData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testHasNoVendorAccount = (args: {
  token: string
  expectedData: ProfileRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path: profilePath,
    validateTestResData: validateProfileResponse,
    compareData: (actual, expected) =>
      compareProfileData(actual, expected as ProfileRequestData),
    expectedData: args.expectedData,
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
    validateTestResData: validateProfileResponse,
    compareData: (actual, expected) =>
      compareProfileData(actual, expected as ProfileRequestData),
  })({})
}
