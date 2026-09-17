import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'

export const updateProductReviewLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedBody || !req.validatedParams) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_item_id } = req.validatedParams
  const { rating, customer_remark } = req.validatedBody

  const existingReview = await knex('product_reviews')
    .where({ order_item_id })
    .first()

  if (!existingReview) {
    throw new NotFoundError('Review not found')
  }

  if (existingReview.customer_id !== req.userId) {
    throw new UnauthorizedError('You can only update your own reviews')
  }

  const [updatedReview] = await knex('product_reviews')
    .where({ order_item_id })
    .andWhere({ customer_id: req.userId })
    .update({
      rating,
      customer_remark,
    })
    .returning('*')

  req.dbResult = updatedReview
  next()
}
