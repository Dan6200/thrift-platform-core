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

const RequestVariantSchema = joi.object({
  sku: joi.string().required(),
  list_price: joi.number(),
  net_price: joi.number(),
  quantity_available: joi.number().required(),
  options: joi.array().items(RequestVariantOptionSchema).min(1).required(),
})

// Base Schemas
export const ProductUpdateDataSchema = joi.object({
  title: joi.string().optional(),
  category_id: joi.number().optional(),
  subcategory_id: joi.number().optional(),
  description: joi.array().items(joi.string()).optional(),
  list_price: joi.number().optional(),
  net_price: joi.number().optional(),
  variants: joi.array().items(RequestVariantSchema).optional(),
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
  query: joi
    .object({ storeId: joi.number().integer().positive().required() })
    .required(),
  params: joi.object().optional(),
})

export const ProductUpdateRequestSchema = joi.object({
  body: ProductUpdateDataSchema.required(),
  query: joi
    .object({ storeId: joi.number().integer().positive().required() })
    .required(),
  params: joi
    .object({ productId: joi.number().integer().positive().required() })
    .required(),
})

export const ProductDeleteRequestSchema = joi.object({
  query: joi
    .object({ storeId: joi.number().integer().positive().required() })
    .required(),
  params: joi
    .object({ productId: joi.number().integer().positive().required() })
    .required(),
  body: joi.object().optional(),
})

export const ProductGetRequestSchema = joi.object({
  params: joi
    .object({ productId: joi.number().integer().positive().required() })
    .required(),
  query: joi.object().optional(),
  body: joi.object().optional(),
})

export const ProductGetAllRequestSchema = joi.object({
  query: joi
    .object({ storeId: joi.number().integer().positive().required() })
    .required(),
  params: joi.object().optional(),
  body: joi.object().optional(),
})

export const ProductResponseSchema = joi
  .object({
    product_id: joi.number().required(),
    title: joi.string().required(),
    category_id: joi.number().required(),
    subcategory_id: joi.number().required(),
    description: joi.array().items(joi.string()),
    list_price: joi.number().required(),
    net_price: joi.number().allow(null).required(),
    vendor_id: joi.string().guid({ version: 'uuidv4' }).required(),
    store_id: joi.number().required(),
    variants: joi.array().items(VariantSchema).allow(null),
    created_at: joi.date().required(),
    updated_at: joi.date().required(),
  })
  .required()

export const ProductGETResponseSchema = joi
  .object({
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
  })
  .required()

export const ProductGETAllResponseSchema = joi
  .object({
    products: joi.array().items(ProductGETResponseSchema).allow(null),
    total_count: joi.number().required(),
  })
  .required()
