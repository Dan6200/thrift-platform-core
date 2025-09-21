import chai from 'chai'
import chaiHttp from 'chai-http'
import { StatusCodes } from 'http-status-codes'
import {
  isValidProductCreateRequestData,
  isValidProductUpdateRequestData,
  isValidProductResponseData,
  isValidProductGETAllResponseData,
  isValidProductGETResponseData,
  isValidProductId,
} from '../../../../types/products/index.js'
import {
  isValidVariantRequestData,
  isValidVariantIdResponseData,
  isValidVariantUpdateRequestData,
  isValidVariantResponseData,
} from '../../../../types/products/variants.js'
import {
  TestRequestWithQParams,
  TestRequestWithQParamsAndBody,
} from '../../test-request/types.js'
import testRoutes from '../../test-request/index.js'

chai.use(chaiHttp).should()

const { CREATED, OK, NOT_FOUND, NO_CONTENT } = StatusCodes

export const testPostProduct = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: CREATED,
  verb: 'post',
  validateTestReqData: isValidProductCreateRequestData,
  validateTestResData: isValidProductId,
})

export const testGetAllProducts = (<TestRequestWithQParams>testRoutes)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidProductGETAllResponseData,
})

export const testGetProduct = (<TestRequestWithQParams>testRoutes)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidProductGETResponseData,
})

export const testUpdateProduct = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: OK,
  verb: 'patch',
  validateTestReqData: isValidProductUpdateRequestData,
  validateTestResData: isValidProductResponseData,
})

export const testDeleteProduct = (<TestRequestWithQParams>testRoutes)({
  statusCode: NO_CONTENT,
  verb: 'delete',
  validateTestResData: null,
})

export const testGetNonExistentProduct = (<TestRequestWithQParams>testRoutes)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})

export const testPostVariant = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: CREATED,
  verb: 'post',
  validateTestReqData: isValidVariantRequestData,
  validateTestResData: isValidVariantIdResponseData,
})

export const testUpdateVariant = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: OK,
  verb: 'patch',
  validateTestReqData: isValidVariantUpdateRequestData,
  validateTestResData: isValidVariantResponseData,
})

export const testDeleteVariant = (<TestRequestWithQParams>testRoutes)({
  statusCode: NO_CONTENT,
  verb: 'delete',
  validateTestResData: null,
})
