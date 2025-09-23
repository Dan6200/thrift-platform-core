import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import ForbiddenError from '#src/errors/forbidden.js'

export const checkDeliveryLimitLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const LIMIT = 3
  const countResult = await knex('delivery_info')
    .where('customer_id', req.userId)
    .count('delivery_info_id as count')
    .first()

  const count = Number(countResult?.count || 0)

  if (count >= LIMIT) {
    throw new ForbiddenError(`Cannot have more than ${LIMIT} addresses.`)
  }

  next()
}
