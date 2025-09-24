import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import BadRequestError from '../errors/bad-request.js'
import logger from '#src/utils/logger.js'

// A middleware factory to validate different parts of the request
export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    let input = {}
    if (Object.entries(req.body).length !== 0) input = { body: req.body }
    if (Object.entries(req.query).length !== 0)
      input = { ...input, query: req.query }
    if (Object.entries(req.params).length !== 0)
      input = { ...input, params: req.params }
    const { error, value } = schema.validate(
      {
        ...input, // avoid passing wrong req fields
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
