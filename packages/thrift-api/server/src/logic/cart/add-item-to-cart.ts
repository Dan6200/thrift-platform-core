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

    const query = `
      INSERT INTO shopping_cart_item (cart_id, variant_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT (cart_id, variant_id)
      DO UPDATE SET quantity = shopping_cart_item.quantity + EXCLUDED.quantity
      RETURNING *;
    `
    const params = [cart.cart_id, variant_id, quantity]

    const { rows: updatedItem } = await trx.raw(query, params)

    return updatedItem
  })
  req.dbResult = result
  next()
}
