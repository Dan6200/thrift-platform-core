import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequestWithBody, TestRequest } from '../../test-request/types.js'
import {
  isValidProductReviewRequest,
  isValidProductReviewResponse,
  isValidProductReviewId,
} from '../../helpers/type-guards/reviews.js'

const { CREATED, OK, NO_CONTENT, NOT_FOUND, FORBIDDEN } = StatusCodes

export const testCreateProductReview = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: CREATED,
  validateTestReqData: isValidProductReviewRequest,
  validateTestResData: isValidProductReviewId,
})

export const testGetProductReview = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: OK,
  validateTestResData: isValidProductReviewResponse,
})

export const testUpdateProductReview = (testRequest as TestRequestWithBody)({
  verb: 'patch',
  statusCode: OK,
  validateTestReqData: isValidProductReviewRequest,
  validateTestResData: isValidProductReviewId,
})

export const testDeleteProductReview = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: NO_CONTENT,
  validateTestResData: null,
})

export const testGetNonExistentProductReview = (testRequest as TestRequest)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})

export const testCreateProductReviewForbidden = (testRequest as TestRequestWithBody)({
  verb: 'post',
  statusCode: FORBIDDEN,
  validateTestReqData: isValidProductReviewRequest,
  validateTestResData: null,
})

export const testUpdateProductReviewForbidden = (testRequest as TestRequestWithBody)({
  verb: 'patch',
  statusCode: FORBIDDEN,
  validateTestReqData: isValidProductReviewRequest,
  validateTestResData: null,
})

export const testDeleteProductReviewForbidden = (testRequest as TestRequest)({
  verb: 'delete',
  statusCode: FORBIDDEN,
  validateTestResData: null,
})
