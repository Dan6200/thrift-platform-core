import Joi from 'joi'

export const AvatarRequestSchema = Joi.object({
  description: Joi.string(),
})

const MediaResponseSchema = Joi.object({
  media_id: Joi.number().required(),
  filename: Joi.string().required(),
  filepath: Joi.string().required(),
  filetype: Joi.string().required(),
  description: Joi.string().allow(null),
  profile_id: Joi.string().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
})

export const AvatarResponseSchema = MediaResponseSchema
