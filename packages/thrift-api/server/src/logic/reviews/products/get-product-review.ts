import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import NotFoundError from '#src/errors/not-found.js'

export const getProductReviewLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.validatedParams) {
    throw new Error('Validated params are missing')
  }
  const { order_item_id } = req.validatedParams

  const review = await knex('product_reviews').where({ order_item_id }).first()

  if (!review) {
    throw new NotFoundError('Review not found')
  }

  req.dbResult = review
  next()
}
