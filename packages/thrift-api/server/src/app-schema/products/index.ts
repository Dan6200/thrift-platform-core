import joi from 'joi'

const VariantOptionSchema = joi.object({
  option_id: joi.number().required(),
  option_name: joi.string().required(),
  value_id: joi.number().required(),
  value: joi.string().required(),
})

const VariantSchema = joi.object({
  variant_id: joi.number().required(),
  sku: joi.string().required(),
  list_price: joi.number().allow(null),
  net_price: joi.number().allow(null),
  quantity_available: joi.number().required(),
  options: joi.array().items(VariantOptionSchema).required(),
})

const RequestVariantOptionSchema = joi.object({
  option_name: joi.string().uppercase().required(),
  value: joi.string().uppercase().required(),
})

export const RequestVariantSchema = joi.object({
  sku: joi.string().required(),
  list_price: joi.number(),
  net_price: joi.number(),
  quantity_available: joi.number().required(),
  options: joi.array().items(RequestVariantOptionSchema).min(1).required(),
})

export const UpdateRequestVariantSchema = joi.object({
  sku: joi.string().optional(),
  list_price: joi.number().optional(),
  net_price: joi.number().optional(),
  quantity_available: joi.number().optional(),
  inventory_change_reason: joi.string().optional(),
  inventory_change_notes: joi.string().optional(),
  options: joi.array().items(RequestVariantOptionSchema).min(1).optional(),
})

// Base Schemas
export const ProductUpdateDataSchema = joi.object({
  title: joi.string().optional(),
  category_id: joi.number().optional(),
  subcategory_id: joi.number().optional(),
  description: joi.array().items(joi.string()).optional(),
  list_price: joi.number().optional(),
  net_price: joi.number().optional(),
  variants: joi.array().items(UpdateRequestVariantSchema).optional(),
})

export const ProductCreateDataSchema = joi.object({
  title: joi.string().required(),
  category_id: joi.number().required(),
  subcategory_id: joi.number().required(),
  description: joi.array().items(joi.string()),
  list_price: joi.number().required(),
  net_price: joi.number().required(),
  variants: joi.array().items(RequestVariantSchema).min(1).required(),
})

// Request Schemas
export const ProductCreateRequestSchema = joi.object({
  body: ProductCreateDataSchema.required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
  params: joi.object().optional(),
})

export const ProductUpdateRequestSchema = joi.object({
  params: joi.object({ productId: joi.number().integer().positive().required() }).required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
  body: ProductUpdateDataSchema.required(),
})

export const ProductDeleteRequestSchema = joi.object({
  params: joi.object({ productId: joi.number().integer().positive().required() }).required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
  body: joi.object().optional(),
})

export const ProductGetRequestSchema = joi.object({
  params: joi.object({ productId: joi.number().integer().positive().required() }).required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
  body: joi.object().optional(),
})

export const ProductGetAllRequestSchema = joi.object({
  query: joi.object({
    store_id: joi.number().integer().positive().required(),
    category: joi.string().optional(),
    subcategory: joi.string().optional(),
    min_price: joi.number().positive().optional(),
    max_price: joi.number().positive().optional(),
    sort: joi.string().optional(),
    order: joi.string().valid('asc', 'desc').optional(),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).optional(),
  }).required(),
  params: joi.object().optional(),
  body: joi.object().optional(),
})

export const ProductVariantCreateRequestSchema = joi.object({
  body: RequestVariantSchema.required(),
  params: joi.object({ productId: joi.number().integer().positive().required() }).required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
})

export const ProductVariantUpdateRequestSchema = joi.object({
  body: UpdateRequestVariantSchema.required(),
  params: joi.object({
    productId: joi.number().integer().positive().required(),
    variantId: joi.number().integer().positive().required(),
  }).required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
})

export const ProductVariantDeleteRequestSchema = joi.object({
  params: joi.object({
    productId: joi.number().integer().positive().required(),
    variantId: joi.number().integer().positive().required(),
  }).required(),
  query: joi.object({ store_id: joi.number().integer().positive().required() }).required(),
  body: joi.object().optional(),
})

// Response Schemas
export const ProductIdSchema = joi.object({
  product_id: joi.number().required(),
}).required()

export const VariantIdSchema = joi.object({
  variant_id: joi.number().required(),
}).required()

export const ProductResponseSchema = joi.object({
  product_id: joi.number().required(),
  title: joi.string().required(),
  category_id: joi.number().required(),
  subcategory_id: joi.number().required(),
  description: joi.array().items(joi.string()),
  list_price: joi.number().required(),
  net_price: joi.number().allow(null).required(),
  vendor_id: joi.string().guid({ version: 'uuidv4' }).required(),
  store_id: joi.number().required(),
  created_at: joi.date().required(),
  updated_at: joi.date().required(),
}).required()

export const ProductGETResponseSchema = joi.object({
  product_id: joi.number().required(),
  title: joi.string().required(),
  category_id: joi.number().required(),
  category_name: joi.string().required(),
  subcategory_id: joi.number().required(),
  subcategory_name: joi.string().required(),
  description: joi.array().items(joi.string()),
  list_price: joi.number().required(),
  net_price: joi.number().allow(null).required(),
  products_sold: joi.number().required(),
  average_rating: joi.number().allow(null).required(),
  review_count: joi.number().allow(null).required(),
  vendor_id: joi.string().guid({ version: 'uuidv4' }).required(),
  store_id: joi.number().required(),
  media: joi.array().allow(null),
  variants: joi.array().items(VariantSchema).allow(null),
  created_at: joi.date().required(),
  updated_at: joi.date().required(),
}).required()

export const ProductGETAllResponseSchema = joi.object({
  products: joi.array().items(ProductGETResponseSchema).allow(null),
  total_count: joi.number().required(),
}).required()