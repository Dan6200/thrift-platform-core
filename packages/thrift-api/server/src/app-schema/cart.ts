import Joi from 'joi'

export const addItemToCartSchema = Joi.object({
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
})

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
})

export const cartItemSchema = Joi.object({
  item_id: Joi.number().integer().positive().required(),
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  product_title: Joi.string().required(),
  price: Joi.number().positive().required(),
  image_url: Joi.string().uri().optional().allow(null, ''),
})

export const cartResponseSchema = Joi.object({
  cart_id: Joi.number().integer().positive().required(),
  customer_id: Joi.string().uuid().required(),
  items: Joi.array().items(cartItemSchema).required(),
  total_items: Joi.number().integer().min(0).required(),
  total_price: Joi.number().positive().required(),
})