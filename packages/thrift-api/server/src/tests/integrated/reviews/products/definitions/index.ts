import { StatusCodes } from 'http-status-codes'
import testRequest from '#src/tests/integrated/test-request/index.js'
import {
  TestRequest,
  RequestParams,
} from '#src/tests/integrated/test-request/types.js'
import {
  isValidProductReviewRequest,
  isValidProductReviewResponse,
  isValidProductReviewId,
} from '../../../helpers/type-guards/reviews.js'
import { ProductReviewRequestData } from '#src/types/reviews.js'

const { CREATED, OK, NO_CONTENT, NOT_FOUND, FORBIDDEN } = StatusCodes

const reviewsPathBase = '/v1/reviews/products'
const buildReviewPath = (orderItemId: number) =>
  `${reviewsPathBase}/${orderItemId}`

export const testCreateProductReview = (args: {
  token: string
  body: ProductReviewRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: reviewsPathBase,
    validateTestReqData: isValidProductReviewRequest,
    validateTestResData: isValidProductReviewResponse,
  })(requestParams)
}

export const testGetProductReview = (args: {
  token: string
  params: { orderItemId: number }
}) => {
  const path = buildReviewPath(args.params.orderItemId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: OK,
    path,
    validateTestResData: isValidProductReviewResponse,
  })(requestParams)
}

export const testUpdateProductReview = (args: {
  token: string
  params: { orderItemId: number }
  body: ProductReviewRequestData
}) => {
  const path = buildReviewPath(args.params.orderItemId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'patch',
    statusCode: OK,
    path,
    validateTestReqData: isValidProductReviewRequest,
    validateTestResData: isValidProductReviewResponse,
  })(requestParams)
}

export const testDeleteProductReview = (args: {
  token: string
  params: { orderItemId: number }
}) => {
  const path = buildReviewPath(args.params.orderItemId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'delete',
    statusCode: NO_CONTENT,
    path,
    validateTestResData: null,
  })(requestParams)
}

export const testGetNonExistentProductReview = (args: {
  token: string
  params: { orderItemId: number }
}) => {
  const path = buildReviewPath(args.params.orderItemId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: NOT_FOUND,
    path,
    validateTestResData: null,
  })(requestParams)
}

export const testCreateProductReviewUnauthorized = (args: {
  token: string
  body: ProductReviewRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: FORBIDDEN,
    path: reviewsPathBase,
    validateTestReqData: isValidProductReviewRequest,
    validateTestResData: null,
  })(requestParams)
}

export const testUpdateProductReviewUnauthorized = (args: {
  token: string
  params: { orderItemId: number }
  body: ProductReviewRequestData
}) => {
  const path = buildReviewPath(args.params.orderItemId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    body: args.body,
  }
  return (testRequest as TestRequest)({
    verb: 'patch',
    statusCode: FORBIDDEN,
    path,
    validateTestReqData: isValidProductReviewRequest,
    validateTestResData: null,
  })(requestParams)
}

export const testDeleteProductReviewUnauthorized = (args: {
  token: string
  params: { orderItemId: number }
}) => {
  const path = buildReviewPath(args.params.orderItemId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
  }
  return (testRequest as TestRequest)({
    verb: 'delete',
    statusCode: FORBIDDEN,
    path,
    validateTestResData: null,
  })(requestParams)
}
