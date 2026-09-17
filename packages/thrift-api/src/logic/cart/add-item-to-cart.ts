import { knex } from '../../db/index.js'
import { Request, Response, NextFunction } from 'express'

export const addItemToCartLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedBody) {
    throw new Error('User not authenticated or request body is missing')
  }

  const { variant_id, quantity } = req.validatedBody

  const result = await knex.transaction(async (trx) => {
    let cart = await trx('shopping_cart')
      .where({ customer_id: req.userId })
      .first()

    if (!cart) {
      ;[cart] = await trx('shopping_cart')
        .insert({ customer_id: req.userId })
        .returning('*')
    }

    // Check inventory
    const inventory = await trx('product_variant_inventory')
      .where({ variant_id })
      .first()

    if (!inventory || inventory.quantity_available < quantity) {
      throw new Error('Not enough stock')
    }

    const [updatedItem] = await trx('shopping_cart_item')
      .insert({
        cart_id: cart.cart_id,
        variant_id,
        quantity,
      })
      .onConflict(['cart_id', 'variant_id'])
      .merge({
        quantity: knex.raw('shopping_cart_item.quantity + ?', [quantity]),
      })
      .returning('*')

    const { cart_id, ...result } = updatedItem
    return result
  })
  req.dbResult = result
  next()
}
