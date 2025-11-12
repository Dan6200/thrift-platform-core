import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '#src/db/index.js'
import { validateAnalyticsQueryParams, getDateRangeClause } from './utils.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @description Retrieves aggregated key performance indicators for the specified store and timeframe.
 */
export const getKPIsLogic = async (
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

  const { parsedStartDate, parsedEndDate } = await validateAnalyticsQueryParams(
    { query: req.validatedQueryParams, userId, params: req.validatedParams },
  )

  const sqlParams: (string | Date)[] = [storeId]
  let paramIndex = 2 // $1 is storeId

  const { clause: orderDateClause, nextParamIndex: orderDateParamIndex } =
    getDateRangeClause(
      parsedStartDate,
      parsedEndDate,
      'o.order_date',
      sqlParams,
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
    sqlParams,
    paramIndex,
  )
  paramIndex = profileCreatedAtParamIndex

  const dbQueryString = `
    SELECT
      COALESCE(SUM(o.total_amount), 0.00) AS "totalRevenue",
      COUNT(DISTINCT o.order_id) AS "totalOrders",
      COALESCE(AVG(o.total_amount), 0.00) AS "averageOrderValue",
      COUNT(DISTINCT CASE WHEN p_customer.created_at ${
        profileCreatedAtClause
          ? profileCreatedAtClause.replace('AND p_customer.created_at', '')
          : ''
      } THEN p_customer.id ELSE NULL END) AS "newCustomers",
      COUNT(DISTINCT CASE WHEN p_customer.created_at NOT ${
        profileCreatedAtClause
          ? profileCreatedAtClause.replace('AND p_customer.created_at', '')
          : ''
      } AND o.customer_id IS NOT NULL THEN p_customer.id ELSE NULL END) AS "returningCustomers"
    FROM orders o
    LEFT JOIN profiles p_customer ON o.customer_id = p_customer.id
    WHERE o.store_id = $1
    ${orderDateClause}
  ;`

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
