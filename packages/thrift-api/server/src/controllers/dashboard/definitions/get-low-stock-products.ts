import { QueryResult, QueryResultRow } from 'pg'
import { knex, pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Lists products with critically low stock levels.
 */
export default async ({
  query,
  userId,
  params,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { storeId } = params

  if (!userId) {
    throw new UnauthorizedError(
      'Authentication required to access dashboard data.',
    )
  }

  if (!storeId) {
    throw new BadRequestError('Store ID is required as a path parameter.')
  }

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [
    userId,
    storeId,
    ['admin', 'editor', 'viewer'],
  ])
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError(
      "You are not authorized to access this store's dashboard.",
    )
  }

  const { parsedLimit, parsedOffset, threshold } =
    await validateDashboardQueryParams({ query })

  const stockThreshold = threshold !== null ? threshold : 20 // Default threshold 20

  if (stockThreshold < 0) {
    throw new BadRequestError('Threshold cannot be negative.')
  }

  const paginationSortClause = getPaginationAndSortClauses(
    '"quantityAvailable"',
    'asc',
    parsedLimit,
    parsedOffset,
  )

  const sqlParams: (string | number)[] = [storeId, stockThreshold]

  const dbQueryString = `
    SELECT
      p.product_id AS "productId",
      p.title AS "productTitle",
      COALESCE(SUM(pvi.total_quantity_available), 0)::int AS "quantityAvailable"
    FROM products p
    JOIN product_variants pv ON p.product_id = pv.product_id
    LEFT JOIN (
        SELECT
            variant_id,
            SUM(quantity_available) AS total_quantity_available
        FROM product_variant_inventory
        GROUP BY variant_id
    ) AS pvi ON pv.variant_id = pvi.variant_id
    WHERE p.store_id = $1
    GROUP BY p.product_id, p.title
    HAVING COALESCE(SUM(pvi.total_quantity_available), 0) <= $2
    ${paginationSortClause};
  `

  return pg.query(dbQueryString, sqlParams)
}
