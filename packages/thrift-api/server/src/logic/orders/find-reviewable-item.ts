// logic/orders/findReviewableItem.ts
import { NextFunction, Request, Response } from 'express'
import { knex } from '#src/db/index.js'
import NotFoundError from '#src/errors/not-found.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'

export const findReviewableItemLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Assumes validation middleware provides validatedQuery and user middleware provides user
  if (!req.userId) {
    throw new UnauthenticatedError('Authentication required')
  }
  if (!req.validatedBody || !req.validatedQueryParams) {
    throw new BadRequestError('Missing parameters')
  }
  const { product_id } = req.validatedQueryParams
  const { userId } = req

  try {
    // Find an order_item for the given product_id and user_id
    // that does not already have a review.
    const reviewableItem = await knex('order_items as oi')
      .join('orders as o', 'oi.order_id', 'o.order_id')
      .join('products as p', 'oi.product_id', 'p.product_id')
      .leftJoin('product_reviews as pr', 'oi.order_item_id', 'pr.order_item_id')
      .where('o.customer_id', userId)
      .where('p.product_id', product_id)
      .whereNull('pr.order_item_id') // Check for items that have NOT been reviewed
      .select('oi.order_item_id')
      .first() // Get the first eligible item to review

    if (!reviewableItem) {
      throw new NotFoundError(
        'No reviewable order item found for this product. You must purchase an item to review it.',
      )
    }

    req.dbResult = reviewableItem
    next()
  } catch (error) {
    next(error)
  }
}
