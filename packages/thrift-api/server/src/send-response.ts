import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import InternalServerError from './errors/internal-server.js'

export const sendResponse = (statusCode: StatusCodes) => {
  return (req: Request, res: Response, _next: NextFunction) => {
    if (req.validatedResponse) {
      return res.status(statusCode).json(req.validatedResponse)
    } else if (statusCode === StatusCodes.NO_CONTENT) {
      return res.status(statusCode).send()
    } else {
      throw new InternalServerError(
        'No validated response data available for non-NO_CONTENT status.',
      )
    }
  }
}
