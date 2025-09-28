import { knex } from '../../db/index.js'
import { Request, Response, NextFunction } from 'express'

export const removeCartItemLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedParams) {
    throw new Error('User not authenticated or params is missing')
  }

  const { itemId: item_id } = req.validatedParams

  const cart = await knex('shopping_cart')
    .where({ customer_id: req.userId })
    .first()

  if (!cart) {
    throw new Error('Cart not found')
  }

  const deletedCount = await knex('shopping_cart_item')
    .where({ item_id, cart_id: cart.cart_id })
    .del()

  if (deletedCount === 0) {
    throw new Error(
      'Item not found in cart or you do not have permission to delete it',
    )
  }
  next()
}
