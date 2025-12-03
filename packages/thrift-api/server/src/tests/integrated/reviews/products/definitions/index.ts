import { StatusCodes } from 'http-status-codes'
import testRequest from '#src/tests/integrated/test-request/index.js'
import {
  TestRequest,
  RequestParams,
} from '#src/tests/integrated/test-request/types.js'
import {
  validateCreateProductReviewReq,
  validateUpdateProductReviewReq,
  validateDeleteProductReviewReq,
  validateGetProductReviewReq,
  validateProductReviewRes,
  validateGetAllProductReviewsRes,
} from '../../../helpers/test-validators/reviews.js'
import { ProductReviewRequestData } from '#src/types/reviews.js'
import { GetProductReviewsByProductIdRequestSchema } from '#src/app-schema/reviews/products.js' // Import schema

const { CREATED, OK, NO_CONTENT, NOT_FOUND, FORBIDDEN } = StatusCodes

const reviewsPathBase = '/v1/reviews/products'
const buildReviewPath = (order_item_id: number) =>
  `${reviewsPathBase}/${order_item_id}`
const buildProductReviewsPath = (product_id: string) =>
  `${reviewsPathBase}/product/${product_id}` // New helper to build product reviews path

export const testCreateProductReview = (args: {
  token: string
  params: { order_item_id: number }
  body: ProductReviewRequestData
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path,
    validateTestReqData: validateCreateProductReviewReq,
    validateTestResData: validateProductReviewRes,
  })(requestParams)
}

export const testGetProductReview = (args: {
  token: string
  params: { order_item_id: number }
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path,
    validateTestReqData: validateGetProductReviewReq,
    validateTestResData: validateProductReviewRes,
  })(requestParams)
}

export const testGetProductReviewsByProductId = (args: {
  product_id: string // No token needed for unauthenticated route
}) => {
  const path = buildProductReviewsPath(args.product_id)
  const requestParams: RequestParams = {
    params: { product_id: args.product_id },
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path,
    validateTestReqData: GetProductReviewsByProductIdRequestSchema, // Use schema for request validation
    validateTestResData: validateGetAllProductReviewsRes,
  })(requestParams)
}

export const testUpdateProductReview = (args: {
  token: string
  params: { order_item_id: number }
  body: ProductReviewRequestData
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'patch',
    statusCode: OK,
    path,
    validateTestReqData: validateUpdateProductReviewReq,
    validateTestResData: validateProductReviewRes,
  })(requestParams)
}

export const testDeleteProductReview = (args: {
  token: string
  params: { order_item_id: number }
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'delete',
    statusCode: NO_CONTENT,
    path,
    validateTestReqData: validateDeleteProductReviewReq,
    validateTestResData: null,
  })(requestParams)
}

export const testGetNonExistentProductReview = (args: {
  token: string
  params: { order_item_id: number }
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: NOT_FOUND,
    path,
    validateTestReqData: validateGetProductReviewReq,
    validateTestResData: null,
  })(requestParams)
}

export const testCreateProductReviewUnauthorized = (args: {
  token: string
  params: { order_item_id: number }
  body: ProductReviewRequestData
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: FORBIDDEN,
    path,
    validateTestReqData: validateCreateProductReviewReq,
    validateTestResData: null,
  })(requestParams)
}

export const testUpdateProductReviewUnauthorized = (args: {
  token: string
  params: { order_item_id: number }
  body: ProductReviewRequestData
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'patch',
    statusCode: FORBIDDEN,
    path,
    validateTestReqData: validateUpdateProductReviewReq,
    validateTestResData: null,
  })(requestParams)
}

export const testDeleteProductReviewUnauthorized = (args: {
  token: string
  params: { order_item_id: number }
}) => {
  const path = buildReviewPath(args.params.order_item_id)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'delete',
    statusCode: FORBIDDEN,
    path,
    validateTestReqData: validateDeleteProductReviewReq,
    validateTestResData: null,
  })(requestParams)
}
