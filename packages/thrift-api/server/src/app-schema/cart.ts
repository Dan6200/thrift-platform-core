import Joi from 'joi'

export const addItemToCartSchema = Joi.object({
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
})

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
})

const cartItemSchema = Joi.object({
  item_id: Joi.number().integer().positive().required(),
  cart_id: Joi.number().integer().positive().required(),
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
})

export const cartResponseSchema = Joi.array().items(
  Joi.object({
    cart_id: Joi.number().integer().positive().required(),
    customer_id: Joi.string().uuid().required(),
    items: Joi.array().items(cartItemSchema).required(),
    total_items: Joi.number().integer().min(0).required(),
    total_price: Joi.number().min(0).required(),
    created_at: Joi.date().required(),
    updated_at: Joi.date().required(),
  }),
)

export const cartItemsSchema = Joi.array().items(cartItemSchema)

