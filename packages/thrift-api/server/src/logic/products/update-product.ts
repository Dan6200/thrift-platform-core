import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'

export const updateProductLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { productId } = req.validatedParams!
  const { variants, ...productData } = req.validatedBody!

  const { storeId } = req.validatedQueryParams!

  const updatedProduct = await knex('products')
    .where({ product_id: productId, store_id: storeId, vendor_id: req.userId })
    .update(productData)
    .returning('*')

  // For now, we are not updating variants in this endpoint.
  // A separate endpoint for variants would be more appropriate.

  req.dbResult = updatedProduct[0]
  next()
}
