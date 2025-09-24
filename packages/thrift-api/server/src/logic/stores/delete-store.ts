import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'
import { Request, Response, NextFunction } from 'express'
import StoreData from '../../types/store-data.js'

export const deleteStoreLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.validatedParams)
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = req.validatedParams
  if (!storeId) throw new BadRequestError('Need store ID param to delete store')

  const result = await knex<StoreData>('stores')
    .where('store_id', storeId)
    .del()
    .returning('store_id')

  req.dbResult = result
  next()
}
