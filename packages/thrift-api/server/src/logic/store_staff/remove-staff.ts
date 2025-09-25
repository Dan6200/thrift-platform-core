import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import NotFoundError from '#src/errors/not-found.js'

export const removeStaffLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { storeId, staffId } = req.validatedParams!

  const deletedCount = await knex('store_staff')
    .where({ store_id: storeId, staff_id: staffId })
    .del()

  if (deletedCount === 0) {
    throw new NotFoundError('Staff member not found for this store.')
  }

  req.dbResult = { message: 'Staff member removed successfully.' }
  next()
}
