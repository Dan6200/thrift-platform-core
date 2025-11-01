import Joi from 'joi'

export const ProductReviewRequestSchema = Joi.object({
  order_item_id: Joi.number().required(),
  rating: Joi.number().min(0.0).max(5.0).required(),
  customer_remark: Joi.string().allow(null, ''),
})

export const ProductReviewResponseSchema = Joi.object({
  order_item_id: Joi.number().required(),
  rating: Joi.number().min(0.0).max(5.0).required(),
  customer_id: Joi.string().uuid().required(),
  customer_remark: Joi.string().allow(null, ''),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
})

export const ProductReviewIdSchema = Joi.object({
  order_item_id: Joi.number().required(),
})
