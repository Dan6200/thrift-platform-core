import chai from 'chai'
import chaiHttp from 'chai-http'
import { StatusCodes } from 'http-status-codes'
import {
  ProductIdSchema,
  ProductGETAllResponseSchema,
  ProductCreateRequestSchema,
  ProductUpdateRequestSchema,
  ProductResponseSchema,
  ProductGETResponseSchema,
} from '#src/app-schema/products/index.js'
import {
  ProductRequestData,
  ProductResponseData,
  ProductID,
} from '../../../../types/products/index.js'
import {
  TestRequestWithQParams,
  TestRequestWithQParamsAndBody,
} from '../../test-request/types.js'
import testRoutes from '../../test-request/index.js'
import {
  VariantIdResponseSchema,
  VariantIdSchema,
  VariantRequestSchema,
  VariantResponseSchema,
  VariantUpdateRequestSchema,
} from '#src/app-schema/products/variants.js'
import {
  VariantId,
  VariantIdResponse,
  VariantRequestData,
  VariantResponseData,
  VariantUpdateRequestData,
} from '#src/types/products/variants.js'

export function isValidVariantId(data: unknown): data is VariantId {
  const { error } = VariantIdSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantRequestData(
  data: unknown,
): data is VariantRequestData {
  const { error } = VariantRequestSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantUpdateRequestData(
  data: unknown,
): data is VariantUpdateRequestData {
  const { error } = VariantUpdateRequestSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantResponseData(
  data: unknown,
): data is VariantResponseData {
  const { error } = VariantResponseSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantIdResponseData(
  data: unknown,
): data is VariantIdResponse {
  const { error } = VariantIdResponseSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}
export function isValidProductUpdateRequestData(
  productData: unknown,
): productData is ProductRequestData {
  const { error } = ProductUpdateRequestSchema.validate(productData)
  error && console.error(error)
  return !error
}

export function isValidProductCreateRequestData(
  productData: unknown,
): productData is ProductRequestData {
  const { error } = ProductCreateRequestSchema.validate(productData)
  error && console.error(error)
  return !error
}

export function isValidProductGETResponseData(
  data: unknown,
): data is ProductResponseData {
  const { error } = ProductGETResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

export function isValidProductResponseData(
  data: unknown,
): data is ProductResponseData {
  const { error } = ProductResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

export function isValidProductId(data: unknown): data is ProductID {
  const { error } = ProductIdSchema.validate(data)
  error && console.error(error)
  return !error
}

export function isValidProductGETAllResponseData(
  data: unknown,
): data is ProductResponseData[] {
  const { error } = ProductGETAllResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

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

