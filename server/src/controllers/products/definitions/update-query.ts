//cspell:ignore jsonb
import { knex } from '../../../db/index.js'
import BadRequestError from '../../../errors/bad-request.js'
import { QueryParams } from '../../../types/process-routes.js'
import {
  isValidProductRequestData,
  ProductResponseData,
} from '../../../types/products/index.js'
import ForbiddenError from '#src/errors/forbidden.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/* @param {QueryParams} {params, query, body, userId}
 * @returns {Promise<ProductResponseData[]>}
 * @description Update a product
 */
export default async ({
  params,
  body,
  userId,
  query,
}: QueryParams): Promise<ProductResponseData[]> => {
  if (!userId) {
    throw new UnauthorizedError('Sign-in to update product.')
  }
  if (params == null) throw new BadRequestError('Must provide product id')
  const { productId } = params
  const { store_id: storeId } = query
  if (!storeId)
    throw new BadRequestError('Need to provide Store ID as query param')

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [userId, storeId, ['admin', 'editor']]);
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError('You do not have permission to update products for this store.');
  }

  if (!isValidProductRequestData(body))
    throw new BadRequestError('Invalid product data')

  const { variants, ...productData } = body

  return knex('products')
    .where('product_id', productId)
    .where('store_id', storeId)
    .where('vendor_id', userId)
    .update(productData)
    .returning('*')
}
