import { ObjectSchema } from 'joi'
import BadRequestError from '../../errors/bad-request.js'

/**
 * @description Validates query parameters against schema
 */
export const validateQuerySchema =
  <T>(schema: ObjectSchema<T>) =>
  (data: unknown) => {
    if (typeof data == 'undefined' || Object.keys(data)?.length === 0)
      throw new BadRequestError('Query parameters cannot be empty')
    const { error } = schema.validate(data)
    if (error) throw new BadRequestError(error.message)
    return true
  }