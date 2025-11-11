import { Request, Response, NextFunction } from 'express'
import { pg } from '../../db/index.js'
import {
  validateAnalyticsQueryParams,
  getDateRangeClause,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import { knex } from '../../db/index.js'

/**
 * @description Retrieves various sales performance reports based on type.
 */
export const getSalesAnalyticsLogic = async (
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

  const {
    parsedStartDate,
    parsedEndDate,
    type,
    parsedLimit,
    parsedOffset,
    sortBy,
    sortOrder,
    status,
  } = await validateAnalyticsQueryParams({
    query: req.validatedQueryParams,
    userId,
    params: req.validatedParams,
  })

  if (!type) {
    throw new BadRequestError(
      'Sales report type (by-product, by-category, recent-orders) is required.',
    )
  }

  const sqlParams: (string | Date)[] = [storeId]
  let paramIndex = 2 // $1 is storeId
  let dbQueryString = ''

  const { clause: orderDateClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'o.order_date',
    sqlParams,
    paramIndex,
  )
  paramIndex = nextParamIndex

  switch (type) {
    case 'by-product':
      if (sortBy && !['unitsSold', 'totalRevenue'].includes(sortBy)) {
        throw new BadRequestError(
          'Invalid sortBy for by-product. Must be unitsSold or totalRevenue.',
        )
      }
      const sortColumnProduct =
        sortBy === 'totalRevenue' ? '"totalRevenue"' : '"unitsSold"'
      const paginationSortClauseProduct = getPaginationAndSortClauses(
        sortColumnProduct,
        sortOrder || 'desc',
        parsedLimit,
        parsedOffset,
      )

      dbQueryString = `
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
        ${paginationSortClauseProduct};
      `
      break

    case 'by-category':
      dbQueryString = `
        SELECT
          c.category_id AS "categoryId",
          c.category_name AS "categoryName",
          COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0.00) AS "totalRevenue"
        FROM categories c
        JOIN products p ON c.category_id = p.category_id
        JOIN product_variants pv ON p.product_id = pv.product_id
        JOIN order_items oi ON pv.variant_id = oi.variant_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE p.store_id = $1 ${orderDateClause}
        GROUP BY c.category_id, c.category_name
        ORDER BY "totalRevenue" DESC;
      `
      break

    case 'recent-orders':
      let statusClause = ''
      if (status) {
        statusClause = `AND o.status = $${paramIndex}`
        sqlParams.push(status as string)
        paramIndex++
      }
      const paginationSortClauseOrder = getPaginationAndSortClauses(
        'o.order_date',
        'desc',
        parsedLimit || 10,
        parsedOffset,
      ) // Default limit 10

      dbQueryString = `
        SELECT
          o.order_id AS "orderId",
          COALESCE(p_customer.first_name || ' ' || p_customer.last_name, 'Guest Customer') AS "customerName",
          o.total_amount AS "totalAmount",
          o.status AS status,
          o.order_date AS "orderDate"
        FROM orders o
        LEFT JOIN profiles p_customer ON o.customer_id = p_customer.id
        WHERE o.store_id = $1 ${orderDateClause} ${statusClause}
        ${paginationSortClauseOrder};
      `
      break

    default:
      throw new BadRequestError('Invalid sales report type.')
  }

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
