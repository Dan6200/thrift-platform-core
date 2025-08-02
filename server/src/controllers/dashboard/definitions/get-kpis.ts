import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import { validateDashboardQueryParams, getDateRangeClause } from './utils.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Retrieves aggregated key performance indicators for the specified store and timeframe.
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { authorizedStoreId, parsedStartDate, parsedEndDate } =
    await validateDashboardQueryParams({ query, userId })

  const params: (string | Date)[] = [authorizedStoreId]
  let paramIndex = 2 // $1 is storeId

  const { clause: orderDateClause, nextParamIndex: orderDateParamIndex } =
    getDateRangeClause(
      parsedStartDate,
      parsedEndDate,
      'o.order_date',
      params,
      paramIndex,
    )
  paramIndex = orderDateParamIndex

  const {
    clause: profileCreatedAtClause,
    nextParamIndex: profileCreatedAtParamIndex,
  } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'p_customer.created_at',
    params,
    paramIndex,
  )
  paramIndex = profileCreatedAtParamIndex

  const dbQueryString = `
    SELECT
      COALESCE(SUM(o.total_amount), 0.00) AS "totalRevenue",
      COUNT(DISTINCT o.order_id) AS "totalOrders",
      COALESCE(AVG(o.total_amount), 0.00) AS "averageOrderValue",
      COUNT(DISTINCT CASE WHEN p_customer.created_at ${profileCreatedAtClause ? profileCreatedAtClause.replace('AND p_customer.created_at', '') : ''} THEN p_customer.id ELSE NULL END) AS "newCustomers",
      COUNT(DISTINCT CASE WHEN p_customer.created_at NOT ${profileCreatedAtClause ? profileCreatedAtClause.replace('AND p_customer.created_at', '') : ''} AND o.customer_id IS NOT NULL THEN p_customer.id ELSE NULL END) AS "returningCustomers"
    FROM orders o
    LEFT JOIN profiles p_customer ON o.customer_id = p_customer.id
    WHERE o.store_id = $1
    ${orderDateClause}
  ;`

  return pg.query(dbQueryString, params)
}
