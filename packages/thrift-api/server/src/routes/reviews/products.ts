import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../../request-validation.js'
import { validateDbResult } from '../../db-result-validation.js'
import { sendResponse } from '../../send-response.js'
import authenticateUser from '../../authentication.js'
import {
  createProductReviewLogic,
  getProductReviewLogic,
  updateProductReviewLogic,
  deleteProductReviewLogic,
} from '../../logic/reviews/products/index.js'
import {
  CreateProductReviewRequestSchema,
  GetProductReviewRequestSchema,
  UpdateProductReviewRequestSchema,
  DeleteProductReviewRequestSchema,
  ProductReviewResponseSchema,
} from '../../app-schema/reviews/products.js'

const router = express.Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

router
  .route('/:order_item_id')
  .post(
    authenticateUser,
    validate(CreateProductReviewRequestSchema),
    createProductReviewLogic,
    validateDbResult(ProductReviewResponseSchema),
    sendResponse(CREATED),
  )
  .get(
    authenticateUser,
    validate(GetProductReviewRequestSchema),
    getProductReviewLogic,
    validateDbResult(ProductReviewResponseSchema),
    sendResponse(OK),
  )
  .patch(
    authenticateUser,
    validate(UpdateProductReviewRequestSchema),
    updateProductReviewLogic,
    validateDbResult(ProductReviewResponseSchema),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    validate(DeleteProductReviewRequestSchema),
    deleteProductReviewLogic,
    sendResponse(NO_CONTENT),
  )

export default router
