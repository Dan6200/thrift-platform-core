import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import InternalServerError from '../errors/internal-server.js'
import logger from '#src/utils/logger.js'

export const validateDbResult = (
  schema: Joi.ObjectSchema | Joi.ArraySchema,
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.dbResult) {
      throw new InternalServerError(
        'Database result not found on request object',
      )
    }

    const { error, value } = schema.validate(req.dbResult)

    if (error) {
      logger.error(error)
      throw new InternalServerError(
        'Database result validation failed: ' +
          error.details.map((detail) => detail.message).join('; '),
      )
    }

    req.validatedResponse = value
    next()
  }
}
