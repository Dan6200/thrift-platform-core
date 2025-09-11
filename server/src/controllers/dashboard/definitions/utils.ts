import { QueryParams } from '../../../types/process-routes.js' // Adjust path
import BadRequestError from '../../../errors/bad-request.js' // Adjust path
import ForbiddenError from '../../../errors/forbidden.js' // Adjust path
import UnauthorizedError from '#src/errors/unauthorized.js' // Adjust path
import { knex } from '../../../db/index.js' // Adjust path

/**
 * Validates common query parameters (storeId, userId, dates, pagination).
 * Also performs authorization check for the store.
 * @param queryParams The QueryParams object from the route processor.
 * @returns An object containing validated parameters and the authorized storeId.
 * @throws {UnauthorizedError} If userId is missing.
 * @throws {BadRequestError} If storeId or date formats are invalid.
 * @throws {ForbiddenError} If the user is not authorized for the specified store.
 */
export async function validateDashboardQueryParams({
  query,
  userId,
  params,
}: QueryParams) {
  const {
    startDate,
    endDate,
    limit,
    offset,
    sortBy,
    sortOrder,
    interval,
    locationType,
    type,
    status,
    threshold,
  } = query

  const { storeId } = params
  console.log(params)

  if (!userId) {
    throw new UnauthorizedError(
      'Authentication required to access dashboard data.',
    )
  }

  if (!storeId) {
    throw new BadRequestError('Store ID is required as a path parameter.')
  }

  // Authorization: Verify the user owns or has access to this storeId
  const storeCheck = await knex('stores')
    .where('store_id', storeId as string)
    .andWhere('vendor_id', userId)
    .first('store_id')

  if (!storeCheck) {
    throw new ForbiddenError(
      "You are not authorized to access this store's dashboard.",
    )
  }

  // Date validation (ISO 8601)
  const parsedStartDate = startDate ? new Date(startDate as string) : null
  const parsedEndDate = endDate ? new Date(endDate as string) : null

  if (
    (startDate && isNaN(parsedStartDate.getTime())) ||
    (endDate && isNaN(parsedEndDate.getTime()))
  ) {
    throw new BadRequestError('Invalid date format. Use ISO 8601 (YYYY-MM-DD).')
  }
  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    throw new BadRequestError('Start date cannot be after end date.')
  }

  // Pagination and sorting defaults
  const parsedLimit = limit ? parseInt(limit as string) : null
  const parsedOffset = offset ? parseInt(offset as string) : null

  if (limit && (isNaN(parsedLimit) || parsedLimit <= 0)) {
    throw new BadRequestError('Limit must be a positive integer.')
  }
  if (offset && (isNaN(parsedOffset) || parsedOffset < 0)) {
    throw new BadRequestError('Offset must be a non-negative integer.')
  }

  return {
    authorizedStoreId: storeId as string,
    parsedStartDate,
    parsedEndDate,
    parsedLimit,
    parsedOffset,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
    interval: interval as 'day' | 'week' | 'month' | 'year',
    locationType: locationType as 'country' | 'city',
    type: type as 'by-product' | 'by-category' | 'recent-orders',
    status: status as string,
    threshold: threshold ? parseInt(threshold as string) : null,
  }
}

/**
 * Constructs a date range WHERE clause for SQL queries.
 * @param startDate The start date (Date object or null).
 * @param endDate The end date (Date object or null).
 * @param column The database column to filter by.
 * @param params The array of query parameters to push dates into.
 * @param paramIndex The starting index for date parameters.
 * @returns A string containing the WHERE clause fragment.
 */
export function getDateRangeClause(
  startDate: Date | null,
  endDate: Date | null,
  column: string,
  params: (string | Date)[],
  paramIndex: number,
): { clause: string; nextParamIndex: number } {
  let clause = ''
  if (startDate && endDate) {
    clause = `AND ${column} BETWEEN $${paramIndex} AND $${paramIndex + 1}`
    params.push(startDate, endDate)
    paramIndex += 2
  } else if (startDate) {
    clause = `AND ${column} >= $${paramIndex}`
    params.push(startDate)
    paramIndex += 1
  } else if (endDate) {
    clause = `AND ${column} <= $${paramIndex}`
    params.push(endDate)
    paramIndex += 1
  }
  return { clause, nextParamIndex: paramIndex }
}

/**
 * Returns the SQL function for date truncation based on the interval.
 * @param interval The aggregation interval ('day', 'week', 'month', 'year').
 * @returns The SQL function string.
 */
export function getIntervalTruncation(
  interval: 'day' | 'week' | 'month' | 'year',
): string {
  switch (interval) {
    case 'day':
      return "DATE_TRUNC('day', order_date)"
    case 'week':
      return "DATE_TRUNC('week', order_date)"
    case 'month':
      return "DATE_TRUNC('month', order_date)"
    case 'year':
      return "DATE_TRUNC('year', order_date)"
    default:
      return "DATE_TRUNC('day', order_date)" // Default to day
  }
}

/**
 * Handles sorting and pagination clauses.
 * @param sortBy The column to sort by.
 * @param sortOrder The sort order ('asc' or 'desc').
 * @param limit The limit for pagination.
 * @param offset The offset for pagination.
 * @returns A string containing the ORDER BY, LIMIT, and OFFSET clauses.
 */
export function getPaginationAndSortClauses(
  sortBy: string | null,
  sortOrder: 'asc' | 'desc' | null,
  limit: number | null,
  offset: number | null,
): string {
  let clauses = ''
  if (sortBy) {
    clauses += ` ORDER BY ${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`
  }
  if (limit !== null) {
    clauses += ` LIMIT ${limit}`
  }
  if (offset !== null) {
    clauses += ` OFFSET ${offset}`
  }
  return clauses
}
