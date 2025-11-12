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
 * @description Lists customers with their calculated Lifetime Value.
 */
export const getCustomerLifetimeValueLogic = async (
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

  const { parsedLimit, parsedOffset, sortBy, sortOrder } =
    await validateAnalyticsQueryParams({
      query: req.validatedQueryParams,
      userId,
      params: req.validatedParams,
    })

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

  const result = await pg.query(dbQueryString, sqlParams)
  req.dbResult = result.rows
  next()
}
