import { knex } from '#src/db/index.js'
import { ProductRequestData } from '#src/types/products/index.js'
import { Request, Response, NextFunction } from 'express'

export const updateProductLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { productId } = req.validatedParams!

  const { storeId } = req.validatedQueryParams!
  const { variants, ...productData } = req.validatedBody! as ProductRequestData

  const [updatedProduct] = await knex('products')
    .where({ product_id: productId, store_id: storeId, vendor_id: req.userId })
    .update(productData)
    .returning('*')

  req.dbResult = updatedProduct
  next()
}
