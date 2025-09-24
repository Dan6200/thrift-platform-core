import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import UnauthorizedError from '../errors/unauthorized.js'

export const checkStoreLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Assuming req.userId is already set by an authentication middleware
  if (!req.userId) {
    // This case should ideally be caught by an authentication middleware before this point
    throw new UnauthorizedError('Authentication required to check store limit')
  }

  const LIMIT = 5
  let { count } = (
    await knex('stores').where('vendor_id', req.userId).count('store_id')
  )[0]
  if (typeof count === 'string') count = parseInt(count)
  if (count >= LIMIT) {
    throw new UnauthorizedError(`Cannot have more than ${LIMIT} stores.`)
  }

  next()
}
