import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import UnauthorizedError from '../errors/unauthorized.js'
import BadRequestError from '../errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'

export const hasStoreAccess = (requiredRoles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId) {
      throw new UnauthenticatedError('Authentication required for store access')
    }

    const storeIdParam =
      req.validatedParams.storeId ??
      req.validatedParams.store_id ??
      req.validatedQueryParams.storeId ??
      req.validatedQueryParams.store_id

    if (!storeIdParam) {
      throw new BadRequestError(
        'Store ID is required in parameters for store access check',
      )
    }

    const storeId = Number(storeIdParam)

    const hasAccessResult = await knex.raw('select has_store_access(?, ?, ?)', [
      req.userId,
      storeId,
      requiredRoles,
    ])

    if (!hasAccessResult.rows[0].has_store_access) {
      throw new UnauthorizedError(
        'You do not have the necessary permissions to access this store.',
      )
    }

    req.authorized = true
    next()
  }
}
