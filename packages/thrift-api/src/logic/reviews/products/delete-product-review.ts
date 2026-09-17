import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'

export const deleteProductReviewLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedParams) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_item_id } = req.validatedParams

  const existingReview = await knex('product_reviews')
    .where({ order_item_id })
    .first()

  if (!existingReview) {
    throw new NotFoundError('Review not found')
  }

  if (existingReview.customer_id !== req.userId) {
    throw new UnauthorizedError('You can only delete your own reviews')
  }

  await knex('product_reviews')
    .where({ order_item_id })
    .andWhere({ customer_id: req.userId })
    .del()

  next()
}
