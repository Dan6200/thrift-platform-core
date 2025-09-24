import Joi from 'joi'
import util from 'util'

export const validateTestData = <T>(schema: Joi.Schema, data: unknown, errorMessage: string): data is T => {
  const { error } = schema.validate(data)
  if (error) {
    console.error(errorMessage)
    console.error(util.inspect(error, true, null, true))
    return false
  }
  return true
}
