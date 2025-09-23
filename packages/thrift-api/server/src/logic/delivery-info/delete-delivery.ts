import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import { Request, Response, NextFunction } from 'express'
import { DeliveryInfo } from '../../types/delivery-info.js'

export const deleteDeliveryLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthenticatedError('Signin to delete delivery information.')
  }
  if (!req.validatedParams)
    throw new BadRequestError('No route parameters provided')
  const { deliveryInfoId } = req.validatedParams
  if (!deliveryInfoId)
    throw new BadRequestError('Need Id param to delete resource')

  const result = await knex<DeliveryInfo>('delivery_info')
    .where('delivery_info_id', deliveryInfoId)
    .where('customer_id', req.userId)
    .del()
    .returning([knex.raw('NOW() as deleted_at')])
  req.dbResult = result
  next()
}
