import joi from 'joi'

export const RegisterRequestSchema = joi.object({
  body: joi
    .object({
      first_name: joi.string().required(),
      last_name: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
      phone: joi.string().optional(),
      dob: joi.date().required(),
      is_vendor: joi.boolean().optional(),
    })
    .required(),
  query: joi.object().optional(),
  params: joi.object().optional(),
})
