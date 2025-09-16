import joi from 'joi'

export const VariantIdSchema = joi
  .array()
  .items(
    joi.object({
      variantId: joi.number().required(),
    }),
  )
  .length(1)

export const VariantRequestSchema = joi
  .object({
    sku: joi.string().required(),
    list_price: joi.number(),
    net_price: joi.number(),
    quantity_available: joi.number().required(),
    options: joi
      .array()
      .items(
        joi.object({
          option_name: joi.string().uppercase().required(),
          value: joi.string().uppercase().required(),
        }),
      )
      .min(1)
      .required(),
  })
  .required()

export const VariantUpdateRequestSchema = joi
  .object({
    sku: joi.string(),
    list_price: joi.number(),
    net_price: joi.number(),
    quantity_available: joi.number(),
  })
  .required()

export const VariantResponseSchema = joi
  .array()
  .items(
    joi.object({
      variant_id: joi.number().required(),
      product_id: joi.number().required(),
      sku: joi.string().required(),
      list_price: joi.number(),
      net_price: joi.number().allow(null),
      quantity_available: joi.number().required(),
      options: joi
        .array()
        .items(
          joi.object({
            option_id: joi.number().required(),
            option_name: joi.string().required(),
            value_id: joi.number().required(),
            value: joi.string().required(),
          }),
        )
        .required(),
      created_at: joi.date().required(),
      updated_at: joi.date().required(),
    }),
  )
  .length(1)

export const VariantIdResponseSchema = joi
  .array()
  .items(
    joi.object({
      variant_id: joi.number().required(),
    }),
  )
  .length(1)
