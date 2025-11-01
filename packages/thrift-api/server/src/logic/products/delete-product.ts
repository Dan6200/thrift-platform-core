import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'

export const deleteProductLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { productId } = req.validatedParams!

  const { storeId } = req.validatedQueryParams!

  await knex('products')
    .where({ product_id: productId, store_id: storeId, vendor_id: req.userId })
    .del()

  next()
}
