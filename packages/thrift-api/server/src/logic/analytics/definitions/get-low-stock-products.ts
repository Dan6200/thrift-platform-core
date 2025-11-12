import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '#src/db/index.js'
import {
  validateAnalyticsQueryParams,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @description Lists products with critically low stock levels.
 */
export const getLowStockProductsLogic = async (
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

  const { parsedLimit, parsedOffset, threshold } =
    await validateAnalyticsQueryParams({
      query: req.validatedQueryParams,
      userId,
      params: req.validatedParams,
    })

  const stockThreshold = threshold !== null ? threshold : 20 // Default threshold 20

  if (stockThreshold < 0) {
    throw new BadRequestError('Threshold cannot be negative.')
  }

  const paginationSortClause = getPaginationAndSortClauses(
    '"quantityAvailable"',
    'asc',
    parsedLimit,
    parsedOffset,
  )

  const sqlParams: (string | number)[] = [storeId, stockThreshold]

  const dbQueryString = `
    SELECT
      p.product_id AS "productId",
      p.title AS "productTitle",
      COALESCE(SUM(pvi.total_quantity_available), 0)::int AS "quantityAvailable"
    FROM products p
    JOIN product_variants pv ON p.product_id = pv.product_id
    LEFT JOIN (
        SELECT
            variant_id,
            SUM(quantity_available) AS total_quantity_available
        FROM product_variant_inventory
        GROUP BY variant_id
    ) AS pvi ON pv.variant_id = pvi.variant_id
    WHERE p.store_id = $1
    GROUP BY p.product_id, p.title
    HAVING COALESCE(SUM(pvi.total_quantity_available), 0) <= $2
    ${paginationSortClause};
  `

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
