import {
  ProductReviewRequestSchema,
  ProductReviewResponseSchema,
  ProductReviewIdSchema,
} from '#src/app-schema/reviews/products.js'
import {
  ProductReviewRequestData,
  ProductReviewResponseData,
  ProductReviewId,
} from '#src/types/reviews.js'

export const isValidProductReviewRequest = (
  data: unknown,
): data is ProductReviewRequestData => {
  const { error } = ProductReviewRequestSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidProductReviewResponse = (
  data: unknown,
): data is ProductReviewResponseData => {
  const { error } = ProductReviewResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidProductReviewId = (
  data: unknown,
): data is ProductReviewId => {
  const { error } = ProductReviewIdSchema.validate(data)
  error && console.error(error)
  return !error
}
