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
  getProductReviewsByProductIdLogic,
} from '../../logic/reviews/products/index.js'
import {
  CreateProductReviewRequestSchema,
  GetProductReviewRequestSchema,
  UpdateProductReviewRequestSchema,
  DeleteProductReviewRequestSchema,
  GetProductReviewsByProductIdRequestSchema,
  ProductReviewResponseSchema,
  ProductReviewGETAllResponseSchema,
} from '../../app-schema/reviews/products.js'

const router = express.Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

// Route for individual order_item_id related review operations
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

// New route for fetching all reviews by product_id
router.route('/product/:product_id').get(
  // No authentication needed to view reviews, typically public
  validate(GetProductReviewsByProductIdRequestSchema),
  getProductReviewsByProductIdLogic,
  validateDbResult(ProductReviewGETAllResponseSchema),
  sendResponse(OK),
)

export default router
