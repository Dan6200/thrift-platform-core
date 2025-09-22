import Joi from 'joi'

export const OrderItemRequestSchema = Joi.object({
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
})

export const OrderCreateRequestSchema = Joi.object({
  store_id: Joi.number().integer().positive().required(),
  delivery_info_id: Joi.number().integer().positive().allow(null),
  items: Joi.array().items(OrderItemRequestSchema).min(1).required(),
})

export const OrderResponseSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  customer_id: Joi.string().uuid().required(),
  store_id: Joi.number().integer().positive().required(),
  delivery_info_id: Joi.number().integer().positive().allow(null).required(),
  order_date: Joi.date().iso().required(),
  total_amount: Joi.number().precision(2).positive().required(),
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  created_at: Joi.date().iso().required(),
  updated_at: Joi.date().iso().required(),
  items: Joi.array().items(Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
    variant_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
    price_at_purchase: Joi.number().precision(2).positive().required(),
  })).required(),
})

export const OrderIdSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
})

export const OrderQuerySchema = Joi.object({
  store_id: Joi.number().integer().positive().required(),
})
