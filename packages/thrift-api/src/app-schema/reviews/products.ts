import Joi from 'joi'

// Base Schemas
export const ProductReviewDataSchema = Joi.object({
  rating: Joi.number().min(0.0).max(5.0).required(),
  customer_remark: Joi.string().allow(null, ''),
})

// Request Schemas
export const CreateProductReviewRequestSchema = Joi.object({
  params: Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
  }).required(),
  body: ProductReviewDataSchema.required(),
  query: Joi.object().optional(),
})

export const UpdateProductReviewRequestSchema = Joi.object({
  params: Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
  }).required(),
  body: ProductReviewDataSchema.required(),
  query: Joi.object().optional(),
})

export const GetProductReviewRequestSchema = Joi.object({
  params: Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
  }).required(),
  body: Joi.object().optional(),
  query: Joi.object().optional(),
})

export const DeleteProductReviewRequestSchema = Joi.object({
  params: Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
  }).required(),
  body: Joi.object().optional(),
  query: Joi.object().optional(),
})

export const GetProductReviewsByProductIdRequestSchema = Joi.object({
  params: Joi.object({
    product_id: Joi.number().integer().positive().required(),
  }).required(),
  body: Joi.object().optional(),
  query: Joi.object().optional(),
})

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
  Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
    rating: Joi.number().min(0.0).max(5.0).required(),
    customer_remark: Joi.string().allow(null, ''),
    created_at: Joi.date().iso().required(),
    first_name: Joi.string().required(), // Added for join
    last_name: Joi.string().required(), // Added for join
  }),
)
