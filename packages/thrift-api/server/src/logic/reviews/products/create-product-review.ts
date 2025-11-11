import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'

export const createProductReviewLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedBody || !req.validatedParams) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_item_id } = req.validatedParams
  const { rating, customer_remark } = req.validatedBody

  // Check if the order item exists and belongs to the user
  const orderItem = await knex('order_items')
    .where({ order_item_id })
    .join('orders', 'order_items.order_id', 'orders.order_id')
    .select('orders.customer_id')
    .first()

  if (!orderItem) {
    throw new NotFoundError('Order item not found')
  }

  if (orderItem.customer_id !== req.userId) {
    throw new UnauthorizedError('You can only review your own order items')
  }

  const [review] = await knex('product_reviews')
    .insert({
      order_item_id,
      rating,
      customer_id: req.userId,
      customer_remark,
    })
    .returning('*')

  req.dbResult = review
  next()
}
