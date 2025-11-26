import { NextFunction, Request, Response } from 'express'
import { knex } from '#src/db/index.js'

export const getProductReviewsByProductIdLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { product_id } = req.validatedParams

  try {
    const reviews = await knex('product_reviews as pr')
      .select(
        'pr.order_item_id',
        'pr.rating',
        'pr.customer_remark',
        'pr.created_at',
        'p.first_name',
        'p.last_name',
      )
      .join('order_items as oi', 'pr.order_item_id', 'oi.order_item_id')
      .join('product_variants as pv', 'oi.variant_id', 'pv.variant_id')
      .join('products as prod', 'pv.product_id', 'prod.product_id') // Corrected join condition for product_id
      .join('profiles as p', 'pr.customer_id', 'p.id')
      .where('prod.product_id', product_id)
      .orderBy('pr.created_at', 'desc')

    req.dbResult = reviews
    next()
  } catch (error) {
    next(error)
  }
}
