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
 * @description Retrieves time-series revenue data for charting.
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { authorizedStoreId, parsedStartDate, parsedEndDate, interval } =
    await validateDashboardQueryParams({ query, userId })

  if (!parsedStartDate || !parsedEndDate) {
    throw new BadRequestError(
      'Start date and end date are required for revenue trends.',
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

  const { clause: orderDateClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'order_date',
    params,
    paramIndex,
  )
  paramIndex = nextParamIndex

  const dateTruncationFunction = getIntervalTruncation(interval || 'day')

  const dbQueryString = `
    SELECT
      ${dateTruncationFunction}::date AS date,
      COALESCE(SUM(total_amount), 0.00) AS revenue
    FROM orders
    WHERE store_id = $1
    ${orderDateClause}
    GROUP BY date
    ORDER BY date ASC;
  ;`

  return pg.query(dbQueryString, params)
}
