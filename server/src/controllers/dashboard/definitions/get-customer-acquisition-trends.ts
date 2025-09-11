import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getDateRangeClause,
  getIntervalTruncation,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Shows customer acquisition trends over time.
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { authorizedStoreId, parsedStartDate, parsedEndDate, interval } =
    await validateDashboardQueryParams({ query, userId })

  if (!parsedStartDate || !parsedEndDate) {
    throw new BadRequestError(
      'Start date and end date are required for customer acquisition trends.',
    )
  }

  const allowedIntervals = ['day', 'week', 'month', 'year']
  if (interval && !allowedIntervals.includes(interval)) {
    throw new BadRequestError(
      'Invalid interval. Must be day, week, month, or year.',
    )
  }

  const params: (string | Date)[] = [authorizedStoreId]
  let paramIndex = 2 // $1 is storeId

  const { clause: profileCreatedAtClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'p.created_at',
    params,
    paramIndex,
  )
  paramIndex = nextParamIndex

  const dateTruncationFunction = getIntervalTruncation(
    interval || 'month',
  ).replace('order_date', 'p.created_at') // Use profiles created_at

  const dbQueryString = `
    SELECT
      ${dateTruncationFunction}::date AS date,
      COUNT(DISTINCT p.id) AS "newCustomers"
    FROM profiles p
    -- To link profiles to a store, we need to join through orders or explicitly assume store_id on profiles if it exists
    -- Assuming a customer is 'acquired' for a store if they made an order with that store during the period
    WHERE p.id IN (
        SELECT customer_id FROM orders WHERE store_id = $1
    )
    ${profileCreatedAtClause}
    GROUP BY date
    ORDER BY date ASC;
  `

  return pg.query(dbQueryString, params)
}
