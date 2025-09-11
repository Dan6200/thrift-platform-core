import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import {
  validateDashboardQueryParams,
  getPaginationAndSortClauses,
} from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Lists customers with their calculated Lifetime Value.
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { authorizedStoreId, parsedLimit, parsedOffset, sortBy, sortOrder } =
    await validateDashboardQueryParams({ query, userId })

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

  const params: string[] = [authorizedStoreId]

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

  return pg.query(dbQueryString, params)
}
