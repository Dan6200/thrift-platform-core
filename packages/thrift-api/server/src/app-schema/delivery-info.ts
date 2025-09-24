// cspell:ignore alphanum
import joi from 'joi'

// Base schema for delivery info data
export const DeliveryInfoDataSchema = joi.object({
  recipient_full_name: joi.string().min(3).max(60).required(),
  address_line_1: joi.string().required(),
  address_line_2: joi.string().allow('').required(),
  city: joi.string().required(),
  state: joi.string().required(),
  zip_postal_code: joi.string().required(),
  country: joi.string().required(),
  phone_number: joi
    .string()
    .pattern(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
    )
    .required(),
  delivery_instructions: joi.string().required(),
})

// Schemas for request validation middleware
export const DeliveryInfoCreateRequestSchema = joi.object({
  body: DeliveryInfoDataSchema.required(),
  query: joi.object().optional(),
  params: joi.object().optional(),
})

export const DeliveryInfoGetRequestSchema = joi.object({
  params: joi
    .object({
      deliveryInfoId: joi.number().integer().positive().required(),
    })
    .required(),
  query: joi.object().optional(),
  body: joi.object().optional(),
})

export const DeliveryInfoUpdateRequestSchema = joi.object({
  params: joi
    .object({
      deliveryInfoId: joi.number().integer().positive().required(),
    })
    .required(),
  body: DeliveryInfoDataSchema.required(),
  query: joi.object().optional(),
})

export const DeliveryInfoDeleteRequestSchema = joi.object({
  params: joi
    .object({
      deliveryInfoId: joi.number().integer().positive().required(),
    })
    .required(),
  query: joi.object().optional(),
  body: joi.object().optional(),
})

// Schemas for response validation middleware
export const DeliveryInfoResponseSchema = joi
  .object({
    delivery_info_id: joi.number().required(),
    customer_id: joi.string().guid({ version: 'uuidv4' }).required(),
    recipient_full_name: joi.string().min(3).max(60).required(),
    address_id: joi.number().required(),
    address_line_1: joi.string().required(),
    address_line_2: joi.string().allow('').required(),
    city: joi.string().required(),
    state: joi.string().required(),
    zip_postal_code: joi.string().required(),
    country: joi.string().required(),
    phone_number: joi
      .string()
      .pattern(
        /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
      )
      .required(),
    delivery_instructions: joi.string().required(),
    created_at: joi.date().required(),
    updated_at: joi.date().required(),
  })
  .required()

export const DeliveryInfoResponseListSchema = joi
  .array()
  .items(DeliveryInfoResponseSchema)
  .required()
