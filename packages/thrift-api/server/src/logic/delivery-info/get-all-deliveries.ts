import { knex } from '#src/db/index.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import { Request, Response, NextFunction } from 'express'
import { DeliveryInfo } from '../../types/delivery-info.js'

export const getAllDeliveriesLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthenticatedError('Sign-in to access delivery information.')
  }

  const result = await knex<DeliveryInfo>('delivery_info')
    .join('address', 'delivery_info.address_id', 'address.address_id')
    .where('delivery_info.customer_id', req.userId)
    .select('*')
  req.dbResult = result
  next()
}
