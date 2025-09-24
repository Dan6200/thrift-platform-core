import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import UnauthenticatedError from '../errors/unauthenticated.js'
import UnauthorizedError from '../errors/unauthorized.js'

export const customerAuthorization = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthenticatedError(
      'Authentication required for customer access',
    )
  }

  const profile = await knex('profiles')
    .where('id', req.userId)
    .select('is_customer')
    .first()

  if (!profile?.is_customer) {
    throw new UnauthorizedError(
      'Access denied: Only customers can perform this action',
    )
  }

  req.authorized = true
  next()
}
