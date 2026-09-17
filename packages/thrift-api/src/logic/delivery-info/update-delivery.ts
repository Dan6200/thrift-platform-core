import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import InternalServerError from '#src/errors/internal-server.js'
import { Request, Response, NextFunction } from 'express'
import { DeliveryInfo } from '../../types/delivery-info.js'

export const updateDeliveryLogic = async (
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
  const deliveryData: DeliveryInfo = req.validatedBody as DeliveryInfo

  if (!deliveryInfoId) {
    throw new BadRequestError('Need delivery-info ID to update resource')
  }

  const {
    delivery_instructions,
    recipient_full_name,
    phone_number,
    address_line_1,
    address_line_2,
    city,
    state,
    zip_postal_code,
    country,
  } = deliveryData

  const deliveryInfoUpdate: Partial<DeliveryInfo> = {}
  if (delivery_instructions !== undefined)
    deliveryInfoUpdate.delivery_instructions = delivery_instructions
  if (recipient_full_name !== undefined)
    deliveryInfoUpdate.recipient_full_name = recipient_full_name
  if (phone_number !== undefined) deliveryInfoUpdate.phone_number = phone_number

  const addressUpdate: Partial<DeliveryInfo> = {}
  if (address_line_1 !== undefined)
    addressUpdate.address_line_1 = address_line_1
  if (address_line_2 !== undefined)
    addressUpdate.address_line_2 = address_line_2
  if (city !== undefined) addressUpdate.city = city
  if (state !== undefined) addressUpdate.state = state
  if (zip_postal_code !== undefined)
    addressUpdate.zip_postal_code = zip_postal_code
  if (country !== undefined) addressUpdate.country = country

  // Start a transaction
  const trx = await knex.transaction()

  try {
    // Get the address_id associated with the delivery_info
    const [currentDeliveryInfo] = await trx('delivery_info')
      .where('delivery_info_id', deliveryInfoId)
      .where('customer_id', req.userId)
      .select('address_id')

    if (!currentDeliveryInfo) {
      throw new BadRequestError('Delivery info for customer not found')
    }

    const { address_id } = currentDeliveryInfo

    let updatedDeliveryInfo: DeliveryInfo | undefined
    if (Object.keys(deliveryInfoUpdate).length > 0) {
      ;[updatedDeliveryInfo] = await trx('delivery_info')
        .where('delivery_info_id', deliveryInfoId)
        .where('customer_id', req.userId)
        .update(deliveryInfoUpdate)
        .returning('*')
    } else {
      ;[updatedDeliveryInfo] = await trx('delivery_info')
        .where('delivery_info_id', deliveryInfoId)
        .where('customer_id', req.userId)
        .select('*')
    }

    let updatedAddress: DeliveryInfo | undefined
    if (Object.keys(addressUpdate).length > 0) {
      ;[updatedAddress] = await trx('address')
        .where('address_id', address_id)
        .update(addressUpdate)
        .returning('*')
    } else {
      ;[updatedAddress] = await trx('address')
        .where('address_id', address_id)
        .select('*')
    }

    await trx.commit()

    const latestUpdatedAt =
      updatedDeliveryInfo && updatedAddress
        ? new Date(
            Math.max(
              updatedDeliveryInfo.updated_at?.getTime() || 0,
              updatedAddress.updated_at?.getTime() || 0,
            ),
          )
        : undefined

    const earliestCreatedAt =
      updatedDeliveryInfo && updatedAddress
        ? new Date(
            Math.min(
              updatedDeliveryInfo.created_at?.getTime() || Infinity,
              updatedAddress.created_at?.getTime() || Infinity,
            ),
          )
        : undefined

    req.dbResult = {
      ...updatedDeliveryInfo,
      ...updatedAddress,
      created_at: earliestCreatedAt,
      updated_at: latestUpdatedAt,
    }
    next()
  } catch (error) {
    await trx.rollback()
    throw new InternalServerError(error.toString())
  }
}
