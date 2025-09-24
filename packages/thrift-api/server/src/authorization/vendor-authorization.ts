import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import UnauthenticatedError from '../errors/unauthenticated.js'
import UnauthorizedError from '../errors/unauthorized.js'

export const isVendor = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthenticatedError('Authentication required for vendor access')
  }

  const profile = await knex('profiles')
    .where('id', req.userId)
    .select('is_vendor')
    .first()

  if (!profile?.is_vendor) {
    throw new UnauthorizedError('Access denied: Only vendors can perform this action')
  }

  req.authorized = true
  next()
}
