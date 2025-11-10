import Joi from 'joi'

// Base Schemas
export const ProductReviewDataSchema = Joi.object({
  rating: Joi.number().min(0.0).max(5.0).required(),
  customer_remark: Joi.string().allow(null, ''),
})

// Request Schemas
export const CreateProductReviewRequestSchema = Joi.object({
  body: ProductReviewDataSchema.required(),
  params: Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
  }).required(),
  query: Joi.object().optional(),
})

export const UpdateProductReviewRequestSchema = CreateProductReviewRequestSchema

export const GetProductReviewRequestSchema = Joi.object({
  body: Joi.object().optional(),
  params: Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
  }).required(),
  query: Joi.object().optional(),
})

export const DeleteProductReviewRequestSchema = GetProductReviewRequestSchema

// Response Schemas
export const ProductReviewResponseSchema = Joi.object({
  order_item_id: Joi.number().integer().positive().required(),
  rating: Joi.number().min(0.0).max(5.0).required(),
  customer_id: Joi.string().uuid().required(),
  customer_remark: Joi.string().allow(null, ''),
  created_at: Joi.date().iso().required(),
  updated_at: Joi.date().iso().required(),
})

export const ProductReviewGETAllResponseSchema = Joi.array().items(
  ProductReviewResponseSchema,
)
