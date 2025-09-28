import Joi from 'joi'

// Base Schemas
export const CartItemDataSchema = Joi.object({
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
})

export const UpdateCartItemDataSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
})

// Request Schemas
export const AddItemToCartRequestSchema = Joi.object({
  body: CartItemDataSchema.required(),
  query: Joi.object().optional(),
  params: Joi.object().optional(),
})

export const UpdateCartItemRequestSchema = Joi.object({
  body: UpdateCartItemDataSchema.required(),
  params: Joi.object({
    itemId: Joi.number().integer().positive().required(),
  }).required(),
  query: Joi.object().optional(),
})

export const RemoveCartItemRequestSchema = Joi.object({
  params: Joi.object({
    itemId: Joi.number().integer().positive().required(),
  }).required(),
  body: Joi.object().optional(),
  query: Joi.object().optional(),
})

export const GetCartRequestSchema = Joi.object({
  body: Joi.object().optional(),
  query: Joi.object().optional(),
  params: Joi.object().optional(),
})

// Response Schemas
export const cartItemResponseSchema = Joi.object({
  item_id: Joi.number().integer().positive().required(),
  variant_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
})

const cartItemSchema = Joi.object({
  product_title: Joi.string().required(),
  price: Joi.number().min(0).required(),
  image_url: Joi.string().uri().allow(null),
}).concat(cartItemResponseSchema)

export const cartResponseSchema = Joi.object({
  cart_id: Joi.number().integer().positive().required(),
  customer_id: Joi.string().uuid().required(),
  items: Joi.array().items(cartItemSchema).required(),
  total_items: Joi.number().integer().min(0).required(),
  total_price: Joi.number().min(0).required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
}).required()
