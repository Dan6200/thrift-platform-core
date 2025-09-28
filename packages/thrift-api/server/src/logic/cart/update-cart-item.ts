import logger from '#src/utils/logger.js'
import { knex } from '../../db/index.js'
import { Request, Response, NextFunction } from 'express'

export const updateCartItemLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedBody || !req.validatedParams) {
    throw new Error('User not authenticated or request body/params is missing')
  }

  const { itemId: item_id } = req.validatedParams
  const { quantity } = req.validatedBody

  const result = await knex.transaction(async (trx) => {
    const cart = await trx('shopping_cart')
      .where({ customer_id: req.userId })
      .first()

    if (!cart) {
      throw new Error('Cart not found')
    }

    const item = await trx('shopping_cart_item')
      .where({ item_id, cart_id: cart.cart_id })
      .first()

    if (!item) {
      throw new Error(
        'Item not found in cart or you do not have permission to update it',
      )
    }

    // Check inventory
    const inventory = await trx('product_variant_inventory')
      .where({ variant_id: item.variant_id })
      .first()

    if (!inventory || inventory.quantity_available < quantity) {
      throw new Error('Not enough stock')
    }

    const [updatedItem] = await trx('shopping_cart_item')
      .where({ item_id, cart_id: cart.cart_id })
      .update({ quantity })
      .returning('*')

    const { cart_id, ...result } = updatedItem
    return result
  })
  req.dbResult = result
  next()
}
