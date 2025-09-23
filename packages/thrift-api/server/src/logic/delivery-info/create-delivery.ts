import { knex } from '#src/db/index.js'
import InternalServerError from '#src/errors/internal-server.js'
import { Request, Response, NextFunction } from 'express'
import { DeliveryInfo } from '../../types/delivery-info.js'

export const createDeliveryLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
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
  } = req.validatedBody as DeliveryInfo

  // Use a transaction to ensure both inserts are successful
  const trx = await knex.transaction()
  try {
    const [address] = await trx('address')
      .insert({
        address_line_1,
        address_line_2,
        city,
        state,
        zip_postal_code,
        country,
      })
      .returning('address_id')

    const deliveryInfoToInsert = {
      customer_id: req.userId,
      address_id: address.address_id,
      recipient_full_name,
      phone_number,
      delivery_instructions,
    }
    const result = await trx('delivery_info')
      .insert(deliveryInfoToInsert)
      .returning(['delivery_info_id', 'created_at', 'updated_at'])

    await trx.commit()
    req.dbResult = result
    next()
  } catch (error) {
    await trx.rollback()
    throw new InternalServerError(error.toString())
  }
}
