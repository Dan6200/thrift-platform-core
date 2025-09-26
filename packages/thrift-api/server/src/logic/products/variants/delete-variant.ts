import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import BadRequestError from '#src/errors/bad-request.js'
import NotFoundError from '#src/errors/not-found.js'

export const deleteVariantLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { productId, variantId } = req.validatedParams!
  const { store_id: storeId } = req.validatedQueryParams!

  // Authorization for product/variant access is handled by preceding middleware

  const variant = await knex('product_variants as pv')
    .join('products as p', 'pv.product_id', 'p.product_id')
    .where({ 'pv.variant_id': variantId, 'pv.product_id': productId, 'p.store_id': storeId })
    .first('pv.variant_id')

  if (!variant) {
    throw new NotFoundError('Variant not found for this product in this store.')
  }

  await knex('product_variants').where({ variant_id: variantId }).del()

  next()
}
