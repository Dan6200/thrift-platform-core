import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Lists products with critically low stock levels.
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { authorizedStoreId, parsedLimit, parsedOffset, threshold } =
    await validateDashboardQueryParams({ query, userId })

  const stockThreshold = threshold !== null ? threshold : 20 // Default threshold 20

  if (stockThreshold < 0) {
    throw new BadRequestError('Threshold cannot be negative.')
  }

  const paginationSortClause = getPaginationAndSortClauses(
    'quantity_available',
    'asc',
    parsedLimit,
    parsedOffset,
  )

  const params: (string | number)[] = [authorizedStoreId, stockThreshold]

  const dbQueryString = `
    SELECT
      product_id AS "productId",
      title AS "productTitle",
      quantity_available AS "quantityAvailable"
    FROM products
    WHERE store_id = $1 AND quantity_available <= $2
    ${paginationSortClause};
  `

  return pg.query(dbQueryString, params)
}
