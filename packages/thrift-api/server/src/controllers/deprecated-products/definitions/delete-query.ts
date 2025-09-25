//cspell:ignore jsonb
import UnauthorizedError from '#src/errors/unauthorized.js'
import { knex } from '../../../db/index.js'
import BadRequestError from '../../../errors/bad-request.js'
import { QueryParams } from '../../../types/process-routes.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'

/**
 * @param {QueryParams} { params, query, userId }
 * @returns {Promise<number>}
 * @description Delete a product
 */

export default async ({
  params,
  userId,
  query,
}: QueryParams): Promise<void> => {
  if (!userId) {
    throw new UnauthenticatedError('Sign-in to delete product.')
  }
  if (params == null) throw new BadRequestError('Must provide product id')
  const { productId } = params
  const { store_id: storeId } = query
  if (!storeId)
    throw new BadRequestError('Need to provide Store ID as query param')

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [
    userId,
    storeId,
    ['admin'],
  ])
  if (!hasAccess.rows[0].has_store_access) {
    throw new UnauthorizedError(
      'You do not have permission to delete products from this store.',
    )
  }

  return knex('products')
    .where('product_id', productId)
    .where('store_id', storeId)
    .where('vendor_id', userId)
    .del()
}
