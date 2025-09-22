import { StatusCodes } from 'http-status-codes'
import {
  ProductReviewRequestSchema,
  ProductReviewResponseSchema,
} from '#src/app-schema/reviews/products.js'
import processRoute from '../../process-routes.js'
import { validateReqData } from '../../utils/request-validation.js'
import { validateResData } from '../../utils/response-validation.js'
import {
  createProductReviewQuery,
  getProductReviewQuery,
  updateProductReviewQuery,
  deleteProductReviewQuery,
} from '../products/definitions.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

export const createProductReview = processRoute({
  Query: createProductReviewQuery,
  status: CREATED,
  validateBody: validateReqData(ProductReviewRequestSchema),
  validateResult: validateResData(ProductReviewResponseSchema),
})

export const getProductReview = processRoute({
  Query: getProductReviewQuery,
  status: OK,
  validateResult: validateResData(ProductReviewResponseSchema),
})

export const updateProductReview = processRoute({
  Query: updateProductReviewQuery,
  status: OK,
  validateBody: validateReqData(ProductReviewRequestSchema),
  validateResult: validateResData(ProductReviewResponseSchema),
})

export const deleteProductReview = processRoute({
  Query: deleteProductReviewQuery,
  status: NO_CONTENT,
})
