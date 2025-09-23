import { QueryResult, QueryResultRow } from 'pg'
import { knex, pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getDateRangeClause,
  getIntervalTruncation,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import ForbiddenError from '#src/errors/forbidden.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Shows customer acquisition trends over time.
 */
export default async ({
  query,
  userId,
  params,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { storeId } = params

  if (!userId) {
    throw new UnauthenticatedError(
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

  const { parsedStartDate, parsedEndDate, interval } =
    await validateDashboardQueryParams({ query })

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

  const sqlParams: (string | Date)[] = [storeId]
  let paramIndex = 2 // $1 is storeId

  const { clause: profileCreatedAtClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'p.created_at',
    sqlParams,
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

  return pg.query(dbQueryString, sqlParams)
}
