import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'
import {
  AddStoreStaffSchema,
  UpdateStoreStaffSchema,
  StoreStaffListResponseSchema,
  StoreStaffResponseSchema,
} from '#src/app-schema/store_staff.js'

const { CREATED, OK, NO_CONTENT, FORBIDDEN } = StatusCodes

export const testAddStaff = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: (data: unknown) =>
    AddStoreStaffSchema.validate(data).error === undefined,
  validateTestResData: (data: unknown) =>
    StoreStaffResponseSchema.validate(data).error === undefined,
})

export const testListStaff = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: OK,
  validateTestResData: (data: unknown) =>
    StoreStaffListResponseSchema.validate(data).error === undefined,
})

export const testUpdateStaff = (testRequest as TestRequestWithBody)({
  verb: 'put',
  statusCode: OK,
  validateTestReqData: (data: unknown) =>
    UpdateStoreStaffSchema.validate(data).error === undefined,
  validateTestResData: (data: unknown) =>
    StoreStaffResponseSchema.validate(data).error === undefined,
})

export const testRemoveStaff = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: NO_CONTENT,
})

export const testAddStaffForbidden = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: FORBIDDEN,
  validateTestReqData: (data: unknown) =>
    AddStoreStaffSchema.validate(data).error === undefined,
})

export const testListStaffForbidden = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: FORBIDDEN,
})

export const testUpdateStaffForbidden = (testRequest as TestRequestWithBody)({
  verb: 'put',
  statusCode: FORBIDDEN,
  validateTestReqData: (data: unknown) =>
    UpdateStoreStaffSchema.validate(data).error === undefined,
})

export const testRemoveStaffForbidden = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: FORBIDDEN,
})
