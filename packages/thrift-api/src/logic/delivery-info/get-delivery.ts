import { knex } from '#src/db/index.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import BadRequestError from '#src/errors/bad-request.js'
import { Request, Response, NextFunction } from 'express'
import { DeliveryInfo } from '../../types/delivery-info.js'

export const getDeliveryLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthenticatedError('Signin to access delivery information.')
  }
  if (!req.validatedParams)
    throw new BadRequestError('No route parameters provided')
  const { deliveryInfoId } = req.validatedParams

  const result = await knex<DeliveryInfo>('delivery_info')
    .join('address', 'delivery_info.address_id', 'address.address_id')
    .where('delivery_info.delivery_info_id', deliveryInfoId)
    .where('delivery_info.customer_id', req.userId)
    .select('*')
    .first()
  req.dbResult = result
  next()
}
