import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '#src/db/index.js'
import {
  validateAnalyticsQueryParams,
  getDateRangeClause,
  getPaginationAndSortClauses,
} from './utils.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import BadRequestError from '#src/errors/bad-request.js'

/**
 * @description Compares product purchases (views are external and will be null).
 */
export const getProductPerformanceLogic = async (
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

  const { parsedStartDate, parsedEndDate, parsedLimit, parsedOffset } =
    await validateAnalyticsQueryParams({
      query: req.validatedQueryParams,
      userId,
      params: req.validatedParams,
    })

  const paginationSortClause = getPaginationAndSortClauses(
    'purchases',
    'desc',
    parsedLimit,
    parsedOffset,
  ) // Sort by purchases by default

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
      COALESCE(SUM(oi.quantity), 0) AS purchases,
      NULL AS views -- Views are external and not in this DB schema
    FROM products p
    JOIN product_variants pv ON p.product_id = pv.product_id
    JOIN order_items oi ON pv.variant_id = oi.variant_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE p.store_id = $1 ${orderDateClause}
    GROUP BY p.product_id, p.title
    ${paginationSortClause};
  `

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
