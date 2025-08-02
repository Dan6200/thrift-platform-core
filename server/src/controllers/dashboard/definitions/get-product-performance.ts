import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getDateRangeClause,
  getPaginationAndSortClauses,
} from './utils.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Compares product purchases (views are external and will be null).
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const {
    authorizedStoreId,
    parsedStartDate,
    parsedEndDate,
    parsedLimit,
    parsedOffset,
  } = await validateDashboardQueryParams({ query, userId })

  const paginationSortClause = getPaginationAndSortClauses(
    'purchases',
    'desc',
    parsedLimit,
    parsedOffset,
  ) // Sort by purchases by default

  const params: (string | Date)[] = [authorizedStoreId]
  let paramIndex = 2 // $1 is storeId

  const { clause: orderDateClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'o.order_date',
    params,
    paramIndex,
  )
  paramIndex = nextParamIndex

  const dbQueryString = `
    SELECT
      p.product_id AS "productId",
      p.title AS "productTitle",
      COALESCE(SUM(oi.quantity), 0) AS purchases,
      NULL AS views -- Views are external and not in this DB schema
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE p.store_id = $1 ${orderDateClause}
    GROUP BY p.product_id, p.title
    ${paginationSortClause};
  `

  return pg.query(dbQueryString, params)
}
