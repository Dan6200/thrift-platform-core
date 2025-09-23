import { QueryResult, QueryResultRow } from 'pg'
import { knex, pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Lists customers with their calculated Lifetime Value.
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
    throw new UnauthorizedError(
      "You are not authorized to access this store's dashboard.",
    )
  }

  const { parsedLimit, parsedOffset, sortBy, sortOrder } =
    await validateDashboardQueryParams({ query })

  if (sortBy && !['clv', 'customerName'].includes(sortBy)) {
    throw new BadRequestError(
      'Invalid sortBy for CLV. Must be clv or customerName.',
    )
  }
  const sortColumn = sortBy === 'customerName' ? 'customer_name' : 'clv' // Map to SQL column
  const paginationSortClause = getPaginationAndSortClauses(
    sortColumn,
    sortOrder || 'desc',
    parsedLimit,
    parsedOffset,
  )

  const sqlParams: string[] = [storeId]

  const dbQueryString = `
    SELECT
      p.id AS "customerId",
      COALESCE(p.first_name || ' ' || p.last_name, 'Guest Customer') AS "customerName",
      COALESCE(SUM(o.total_amount), 0.00) AS clv
    FROM profiles p
    JOIN orders o ON p.id = o.customer_id
    WHERE o.store_id = $1
    GROUP BY p.id, "customerName"
    ${paginationSortClause};
  `

  return pg.query(dbQueryString, sqlParams)
}
