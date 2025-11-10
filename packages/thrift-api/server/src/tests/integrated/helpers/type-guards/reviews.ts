import {
  ProductReviewRequestSchema,
  ProductReviewResponseSchema,
  ProductReviewIdSchema,
  ProductReviewGETAllResponseSchema,
  ProductReviewQuerySchema,
} from '#src/app-schema/reviews/products.js'
import {
  ProductReviewRequestData,
  ProductReviewResponseData,
  ProductReviewId,
  ProductReviewQueryData,
} from '#src/types/reviews.js'

export const isValidProductReviewRequest = (
  data: any,
): data is ProductReviewRequestData => {
  const { error } = ProductReviewRequestSchema.validate(data.body)
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

export const isValidProductReviewGETAllResponse = (
  data: unknown,
): data is ProductReviewResponseData[] => {
  const { error } = ProductReviewGETAllResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidProductReviewQuery = (
  data: any,
): data is ProductReviewQueryData => {
  const { error } = ProductReviewQuerySchema.validate(data.query)
  error && console.error(error)
  return !error
}
