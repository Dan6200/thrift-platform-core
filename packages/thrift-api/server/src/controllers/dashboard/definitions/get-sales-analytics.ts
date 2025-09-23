import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getDateRangeClause,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import ForbiddenError from '#src/errors/forbidden.js'
import { knex } from '../../../db/index.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Retrieves various sales performance reports based on type.
 */

export default async ({
  query,
  userId,
  params, // Add params here
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { storeId } = params // Extract storeId

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

  const {
    parsedStartDate,
    parsedEndDate,
    type,
    parsedLimit,
    parsedOffset,
    sortBy,
    sortOrder,
    status,
  } = await validateDashboardQueryParams({ query }) // Remove userId from here

  if (!type) {
    throw new BadRequestError(
      'Sales report type (by-product, by-category, recent-orders) is required.',
    )
  }

  const sqlParams: (string | Date)[] = [storeId] // Change params to sqlParams
  let paramIndex = 2 // $1 is storeId
  let dbQueryString = ''

  const { clause: orderDateClause, nextParamIndex } = getDateRangeClause(
    parsedStartDate,
    parsedEndDate,
    'o.order_date',
    sqlParams, // Changed from params
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
        sqlParams.push(status as string) // Changed from params.push
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

  return pg.query(dbQueryString, sqlParams) // Changed from params
}
