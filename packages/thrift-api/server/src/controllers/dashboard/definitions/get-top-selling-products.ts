import { QueryResult, QueryResultRow } from 'pg'
import { knex, pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getDateRangeClause,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Lists top-selling products by units or revenue.
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

  const { parsedStartDate, parsedEndDate, sortBy, parsedLimit } =
    await validateDashboardQueryParams({ query })

  if (sortBy && !['units', 'revenue'].includes(sortBy)) {
    throw new BadRequestError('Invalid sortBy. Must be units or revenue.')
  }

  const sortColumn = sortBy === 'revenue' ? '"totalRevenue"' : '"unitsSold"'
  const paginationSortClause = getPaginationAndSortClauses(
    sortColumn,
    'desc',
    parsedLimit || 10,
    null,
  ) // Default limit 10, no offset for top-N

  const sqlParams: (string | Date)[] = [storeId]
  let paramIndex = 2 // $1 is storeId

  const { clause: orderDateClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'o.order_date',
    sqlParams,
    paramIndex,
  )
  paramIndex = nextParamIndex

  const dbQueryString = `
    SELECT
      p.product_id AS "productId",
      p.title AS "productTitle",
      COALESCE(SUM(oi.quantity), 0) AS "unitsSold",
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0.00) AS "totalRevenue"
    FROM products p
    JOIN product_variants pv ON p.product_id = pv.product_id
    JOIN order_items oi ON pv.variant_id = oi.variant_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE p.store_id = $1 ${orderDateClause}
    GROUP BY p.product_id, p.title
    ${paginationSortClause};
  `

  return pg.query(dbQueryString, sqlParams)
}
