import Joi from 'joi'

export const ProductMediaQuerySchema = Joi.object({
    product_id: Joi.string().required()
})

export const ProductMediaRequestSchema = Joi.object({
  descriptions: Joi.string().required(),
  is_display_image: Joi.string().required(),
  is_thumbnail_image: Joi.string().required(),
  filetype: Joi.string().required(),
})

const MediaResponseSchema = Joi.object({
    media_id: Joi.number().required(),
    filename: Joi.string().required(),
    filepath: Joi.string().required(),
    filetype: Joi.string().required(),
    description: Joi.string().allow(null),
    uploader_id: Joi.string().required(),
    created_at: Joi.date().required(),
    updated_at: Joi.date().required(),
})

export const ProductMediaResponseSchema = Joi.array().items(MediaResponseSchema)

export const AvatarResponseSchema = MediaResponseSchema
