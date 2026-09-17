import { Request, Response, NextFunction } from 'express'
import { knex, pg } from '#src/db/index.js'
import { validateAnalyticsQueryParams } from './utils.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @description Breakdown of customers by geographic location.
 */
export const getCustomersByLocationLogic = async (
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

  const { locationType } = await validateAnalyticsQueryParams({
    query: req.validatedQueryParams,
    userId,
    params: req.validatedParams,
  })

  const allowedLocationTypes = ['country', 'city']
  if (locationType && !allowedLocationTypes.includes(locationType)) {
    throw new BadRequestError('Invalid locationType. Must be country or city.')
  }

  const groupByColumn = locationType === 'city' ? 'a.city' : 'a.country'

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

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
