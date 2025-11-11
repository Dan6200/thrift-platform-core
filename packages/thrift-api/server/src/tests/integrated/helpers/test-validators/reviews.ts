import {
  CreateProductReviewRequestSchema,
  UpdateProductReviewRequestSchema,
  DeleteProductReviewRequestSchema,
  GetProductReviewRequestSchema,
  ProductReviewResponseSchema,
  ProductReviewGETAllResponseSchema,
} from '#src/app-schema/reviews/products.js'
import { validateTestData } from '../test-validators.js'

export const validateCreateProductReviewReq = (data: unknown) =>
  validateTestData(
    CreateProductReviewRequestSchema,
    data,
    'Create Product Review Request Validation Error',
  )

export const validateUpdateProductReviewReq = (data: unknown) =>
  validateTestData(
    UpdateProductReviewRequestSchema,
    data,
    'Update Product Review Request Validation Error',
  )

export const validateDeleteProductReviewReq = (data: unknown) =>
  validateTestData(
    DeleteProductReviewRequestSchema,
    data,
    'Delete Product Review Request Validation Error',
  )

export const validateGetProductReviewReq = (data: unknown) =>
  validateTestData(
    GetProductReviewRequestSchema,
    data,
    'Get Product Review Request Validation Error',
  )

export const validateProductReviewRes = (data: unknown) =>
  validateTestData(
    ProductReviewResponseSchema,
    data,
    'Product Review Response Validation Error',
  )

export const validateGetAllProductReviewsRes = (data: unknown) =>
  validateTestData(
    ProductReviewGETAllResponseSchema,
    data,
    'Get All Product Reviews Response Validation Error',
  )
