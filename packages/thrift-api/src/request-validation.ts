import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import BadRequestError from './errors/bad-request.js'
import logger from '#src/utils/logger.js'

// A middleware factory to validate different parts of the request
export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      { abortEarly: false },
    ) // abortEarly: false shows all validation errors

    if (error) {
      logger.error(error)
      // If validation fails, throw a BadRequestError
      throw new BadRequestError(
        'Validation failed: ' +
          error.details.map((detail) => detail.message).join('; '),
      )
    }

    // If validation is successful, set the validated data on the request object
    req.validatedBody = value.body
    req.validatedQueryParams = value.query
    req.validatedParams = value.params

    next()
  }
