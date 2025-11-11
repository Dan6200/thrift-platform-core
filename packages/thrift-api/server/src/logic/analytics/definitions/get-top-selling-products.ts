import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '../../db/index.js'
import {
  validateAnalyticsQueryParams,
  getDateRangeClause,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @description Lists top-selling products by units or revenue.
 */
export const getTopSellingProductsLogic = async (
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

  const { parsedStartDate, parsedEndDate, sortBy, parsedLimit } =
    await validateAnalyticsQueryParams({
      query: req.validatedQueryParams,
      userId,
      params: req.validatedParams,
    })

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

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
