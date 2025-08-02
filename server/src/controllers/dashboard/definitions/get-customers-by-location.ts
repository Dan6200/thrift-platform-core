import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../db/index.js' // Adjust path
import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import { validateDashboardQueryParams } from './utils.js'
import BadRequestError from '../../../errors/bad-request.js' // Adjust path

/**
 * @param {QueryParams} { query, userId }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Breakdown of customers by geographic location.
 */
export default async ({
  query,
  userId,
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  const { authorizedStoreId, locationType } =
    await validateDashboardQueryParams({ query, userId })

  const allowedLocationTypes = ['country', 'city']
  if (locationType && !allowedLocationTypes.includes(locationType)) {
    throw new BadRequestError('Invalid locationType. Must be country or city.')
  }

  const groupByColumn = locationType === 'city' ? 'a.city' : 'a.country'
  const locationAlias = locationType === 'city' ? 'city' : 'country' // For the response field name

  const params: string[] = [authorizedStoreId]

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

  return pg.query(dbQueryString, params)
}
