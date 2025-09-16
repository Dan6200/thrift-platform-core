import { QueryResult, QueryResultRow } from 'pg'
import { knex, pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import { validateDashboardQueryParams } from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Breakdown of customers by geographic location.
 */
export default async ({
  query,
  userId,
  params,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { storeId } = params

  if (!userId) {
    throw new UnauthorizedError(
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

  const { locationType } =
    await validateDashboardQueryParams({ query })

  const allowedLocationTypes = ['country', 'city']
  if (locationType && !allowedLocationTypes.includes(locationType)) {
    throw new BadRequestError('Invalid locationType. Must be country or city.')
  }

  const groupByColumn = locationType === 'city' ? 'a.city' : 'a.country'
  const locationAlias = locationType === 'city' ? 'city' : 'country' // For the response field name

  const sqlParams: string[] = [storeId]

  const dbQueryString = `
    SELECT
      ${groupByColumn} AS "location",
      COUNT(DISTINCT p.id) AS "customerCount"
    FROM profiles p
    JOIN delivery_info di ON p.id = di.customer_id
    JOIN address a ON di.address_id = a.address_id
    -- Link customer profiles to the store via their orders
    WHERE p.id IN (SELECT customer_id FROM orders WHERE store_id = $1)
    GROUP BY "location"
    ORDER BY "customerCount" DESC;
  `

  return pg.query(dbQueryString, sqlParams)
}
