import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'
import {
  isValidDeliveryInfoId,
  isValidDeliveryInfoCreateRequest,
  isValidDeliveryInfoGetRequest,
  isValidDeliveryInfoUpdateRequest,
  isValidDeliveryInfoDeleteRequest,
  isValidDeliveryInfoResponseList,
  isValidDeliveryInfoResponse,
} from '../../helpers/type-guards/delivery-info.js'

const { CREATED, OK, NOT_FOUND } = StatusCodes

const testCreateDelivery = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: isValidDeliveryInfoCreateRequest,
  validateTestResData: isValidDeliveryInfoResponse,
})

const testGetAllDelivery = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidDeliveryInfoResponseList,
})

const testGetDelivery = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'get',
  validateTestReqData: isValidDeliveryInfoGetRequest,
  validateTestResData: isValidDeliveryInfoResponse,
})

const testUpdateDelivery = (testRequest as TestRequestWithBody)({
  statusCode: OK,
  verb: 'put',
  validateTestReqData: isValidDeliveryInfoUpdateRequest,
  validateTestResData: isValidDeliveryInfoId,
})

const testDeleteDelivery = (testRequest as TestRequest)({
  statusCode: OK,
  verb: 'delete',
  validateTestReqData: isValidDeliveryInfoDeleteRequest,
  validateTestResData: isValidDeliveryInfoId,
})

const testGetNonExistentDelivery = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})

export {
  testCreateDelivery,
  testGetAllDelivery,
  testGetDelivery,
  testUpdateDelivery,
  testDeleteDelivery,
  testGetNonExistentDelivery,
}
