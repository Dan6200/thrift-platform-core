import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '#src/db/index.js'
import {
  validateAnalyticsQueryParams,
  getDateRangeClause,
  getIntervalTruncation,
} from './utils.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @description Shows customer acquisition trends over time.
 */
export const getCustomerAcquisitionTrendsLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { storeId } = req.validatedParams
  const { userId } = req

  if (!userId) {
    throw new UnauthenticatedError(
      'Authentication required to access analytics data.',
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
    throw new UnauthorizedError(
      "You are not authorized to access this store's analytics.",
    )
  }

  const { parsedStartDate, parsedEndDate, interval } =
    await validateAnalyticsQueryParams({
      query: req.validatedQueryParams,
      userId,
      params: req.validatedParams,
    })

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

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
