import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '../../db/index.js'
import {
  validateAnalyticsQueryParams,
  getDateRangeClause,
  getIntervalTruncation,
} from './utils.js'
import BadRequestError from '../../errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @description Retrieves time-series revenue data for charting.
 */
export const getRevenueTrendsLogic = async (
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

  // Authorization: Verify the user owns or has access to this storeId
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
      'Start date and end date are required for revenue trends.',
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

  const { clause: orderDateClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'order_date',
    sqlParams,
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
    ORDER BY date ASC;`

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
