import Joi from 'joi'

export const GetProductMediaRequestSchema = Joi.object({
  params: Joi.object({
    mediaId: Joi.number().integer().positive().required(),
  }).required(),
  query: Joi.object().optional(),
  body: Joi.object().optional(),
})

export const CreateProductMediaRequestSchema = Joi.object({
  params: Joi.object().optional(),
  body: Joi.object({
    product_id: Joi.string().required(),
    descriptions: Joi.string().required(),
    is_display_image: Joi.string().required(),
    is_thumbnail_image: Joi.string().required(),
    filetypes: Joi.string().required(),
  }).required(),
  query: Joi.object({
    store_id: Joi.number().required(),
  }).required(),
})

export const UpdateProductMediaRequestSchema = Joi.object({
  params: Joi.object({
    mediaId: Joi.number().integer().positive().required(),
  }).required(),
  body: Joi.object({
    description: Joi.string(),
    is_display_image: Joi.string(),
    is_thumbnail_image: Joi.string(),
    filetype: Joi.string(),
  }).required(),
  query: Joi.object({
    store_id: Joi.number().required(),
  }).required(),
})

export const DeleteProductMediaRequestSchema = Joi.object({
  params: Joi.object({
    mediaId: Joi.number().integer().positive().required(),
  }).required(),
  query: Joi.object({
    store_id: Joi.number().required(),
  }).required(),
  body: Joi.object().optional(),
})

export const ProductMediaResponseSchema = Joi.object({
  media_id: Joi.number().required(),
  filename: Joi.string().required(),
  filepath: Joi.string().required(),
  filetype: Joi.string().required(),
  description: Joi.string().allow(null),
  uploader_id: Joi.string().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
  is_display_image: Joi.boolean().optional(),
  is_thumbnail_image: Joi.boolean().optional(),
  variant_id: Joi.number().required(),
})
