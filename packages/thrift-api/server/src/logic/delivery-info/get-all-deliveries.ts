import { knex } from '#src/db/index.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
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
    .select(
      'delivery_info.delivery_info_id',
      'delivery_info.recipient_full_name',
      'delivery_info.phone_number',
      'delivery_info.delivery_instructions',
      'address.address_line_1',
      'address.address_line_2',
      'address.city',
      'address.state',
      'address.zip_postal_code',
      'address.country',
      'delivery_info.created_at',
      'delivery_info.updated_at',
    )
  req.dbResult = result
  next()
}
