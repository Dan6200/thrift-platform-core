import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'
import {
  isValidAddStoreStaffRequest,
  isValidUpdateStoreStaffRequest,
  isValidStoreStaffListResponse,
  isValidStoreStaffResponse,
} from '../../helpers/type-guards/store-staff.js'

const { CREATED, OK, NO_CONTENT, FORBIDDEN } = StatusCodes

export const testAddStaff = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: isValidAddStoreStaffRequest,
  validateTestResData: isValidStoreStaffResponse,
})

export const testListStaff = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: OK,
  validateTestResData: isValidStoreStaffListResponse,
})

export const testUpdateStaff = (testRequest as TestRequestWithBody)({
  verb: 'put',
  statusCode: OK,
  validateTestReqData: isValidUpdateStoreStaffRequest,
  validateTestResData: isValidStoreStaffResponse,
})

export const testRemoveStaff = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: NO_CONTENT,
})

export const testAddStaffUnauthorized = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: FORBIDDEN,
  validateTestReqData: isValidAddStoreStaffRequest,
})

export const testListStaffUnauthorized = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: FORBIDDEN,
})

export const testUpdateStaffUnauthorized = (testRequest as TestRequestWithBody)(
  {
    verb: 'put',
    statusCode: FORBIDDEN,
    validateTestReqData: isValidUpdateStoreStaffRequest,
  },
)

export const testRemoveStaffUnauthorized = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: FORBIDDEN,
})

